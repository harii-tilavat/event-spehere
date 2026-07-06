import { Op, Transaction, type WhereOptions } from "sequelize";
import type {
  BookingCreateInput,
  BookingDto,
  BookingListQuery,
  CheckoutInfoDto,
  Meta,
} from "@eventsphere/shared";
import { BOOKING_HOLD_MINUTES } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import { env } from "@/config/env.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";
import { generateBookingNumber, generateTicketCode } from "@/utils/booking-number.js";
import { hmacSha256 } from "@/utils/crypto.js";
import { Booking, BookingItem, Event, Payment, Ticket, TicketType, User, Venue } from "@/models/index.js";
import { createOrder } from "@/services/payment-provider.js";
import { sendEmailAsync } from "@/services/email.service.js";
import { bookingCancelledEmail, bookingConfirmedEmail } from "@/emails/templates.js";

export function qrPayloadFor(ticketCode: string): string {
  return `${ticketCode}.${hmacSha256(ticketCode, env.QR_TICKET_SECRET)}`;
}

const bookingInclude = [
  { model: Event, as: "event", include: [{ model: Venue, as: "venue" }], paranoid: false },
  {
    model: BookingItem,
    as: "items",
    include: [
      { model: TicketType, as: "ticketType" },
      { model: Ticket, as: "tickets" },
    ],
  },
  { model: Payment, as: "payments" },
  { model: User, as: "attendee", paranoid: false },
];

export function toBookingDto(b: Booking, includeAttendee = false): BookingDto {
  const latestPayment = (b.payments ?? []).slice().sort((a, x) => x.id - a.id)[0] ?? null;
  return {
    id: b.id,
    bookingNumber: b.bookingNumber,
    status: b.status,
    totalAmountPaise: b.totalAmountPaise,
    expiresAt: b.expiresAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    event: {
      id: b.event!.id,
      title: b.event!.title,
      slug: b.event!.slug,
      bannerUrl: b.event!.bannerUrl,
      startTime: b.event!.startTime.toISOString(),
      venueName: b.event!.venue?.name ?? "",
      city: b.event!.venue?.city ?? "",
    },
    items: (b.items ?? []).map((i) => ({
      id: i.id,
      ticketTypeId: i.ticketTypeId,
      ticketTypeName: i.ticketType?.name ?? "Ticket",
      quantity: i.quantity,
      unitPricePaise: i.unitPricePaise,
      subtotalPaise: i.subtotalPaise,
    })),
    tickets: (b.items ?? []).flatMap((i) =>
      (i.tickets ?? []).map((t) => ({
        id: t.id,
        ticketCode: t.ticketCode,
        qrPayload: qrPayloadFor(t.ticketCode),
        status: t.status,
        ticketTypeName: i.ticketType?.name ?? "Ticket",
        checkedInAt: t.checkedInAt?.toISOString() ?? null,
      })),
    ),
    payment: latestPayment
      ? { orderId: latestPayment.razorpayOrderId, status: latestPayment.status, method: latestPayment.method }
      : null,
    attendee: includeAttendee && b.attendee ? { id: b.attendee.id, name: b.attendee.name, email: b.attendee.email } : null,
  };
}

async function loadBooking(id: number): Promise<Booking> {
  const booking = await Booking.findByPk(id, { include: bookingInclude });
  if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");
  return booking;
}

/** Lazily expire a stale pending booking so correctness never depends on the cron (docs/10 §1). */
async function expireIfStale(booking: Booking): Promise<Booking> {
  if (booking.status === "pending" && booking.expiresAt && booking.expiresAt < new Date()) {
    await expireBooking(booking.id);
    return loadBooking(booking.id);
  }
  return booking;
}

// ---------- Create (docs/03 §4: locked transaction + TTL hold) ----------

export async function createBooking(
  attendeeId: number,
  input: BookingCreateInput,
): Promise<{ booking: Booking; checkout: CheckoutInfoDto }> {
  const event = await Event.findByPk(input.eventId);
  if (!event || event.status !== "published") throw new AppError(404, "NOT_FOUND", "Event not found");
  if (event.registrationDeadline < new Date()) {
    throw new AppError(409, "BOOKING_EXPIRED", "Registration for this event has closed");
  }

  // merge duplicate ticket type rows
  const quantities = new Map<number, number>();
  for (const item of input.items) {
    quantities.set(item.ticketTypeId, (quantities.get(item.ticketTypeId) ?? 0) + item.quantity);
  }
  const ticketTypeIds = [...quantities.keys()];

  const bookingId = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (t) => {
      const ticketTypes = await TicketType.findAll({
        where: { id: { [Op.in]: ticketTypeIds }, eventId: event.id },
        transaction: t,
        lock: t.LOCK.UPDATE, // SELECT ... FOR UPDATE — serializes competing bookings
      });
      if (ticketTypes.length !== ticketTypeIds.length) {
        throw new AppError(422, "VALIDATION_ERROR", "One or more ticket types do not belong to this event");
      }

      const now = new Date();
      let totalPaise = 0;
      for (const tt of ticketTypes) {
        const qty = quantities.get(tt.id)!;
        if (!tt.isActive) throw new AppError(409, "SOLD_OUT", `${tt.name} is not on sale`);
        if (tt.saleStart && tt.saleStart > now) throw new AppError(409, "SOLD_OUT", `${tt.name} sale has not started`);
        if (tt.saleEnd && tt.saleEnd < now) throw new AppError(409, "SOLD_OUT", `${tt.name} sale has ended`);
        if (qty > tt.maxPerBooking) {
          throw new AppError(422, "VALIDATION_ERROR", `Maximum ${tt.maxPerBooking} × ${tt.name} per booking`);
        }
        if (tt.quantitySold + qty > tt.quantityTotal) {
          const left = Math.max(0, tt.quantityTotal - tt.quantitySold);
          throw new AppError(409, "SOLD_OUT", left === 0 ? `${tt.name} is sold out` : `Only ${left} × ${tt.name} left`);
        }
        totalPaise += tt.pricePaise * qty;
      }

      for (const tt of ticketTypes) {
        await tt.update({ quantitySold: tt.quantitySold + quantities.get(tt.id)! }, { transaction: t });
      }

      const booking = await Booking.create(
        {
          bookingNumber: generateBookingNumber(),
          attendeeId,
          eventId: event.id,
          status: "pending",
          totalAmountPaise: totalPaise,
          expiresAt: new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000),
          cancelledAt: null,
        },
        { transaction: t },
      );
      await BookingItem.bulkCreate(
        ticketTypes.map((tt) => ({
          bookingId: booking.id,
          ticketTypeId: tt.id,
          quantity: quantities.get(tt.id)!,
          unitPricePaise: tt.pricePaise,
          subtotalPaise: tt.pricePaise * quantities.get(tt.id)!,
        })),
        { transaction: t },
      );
      return booking.id;
    },
  );

  const booking = await loadBooking(bookingId);
  const order = await createOrder(booking.totalAmountPaise, booking.bookingNumber);
  await Payment.create({
    bookingId: booking.id,
    razorpayOrderId: order.orderId,
    razorpayPaymentId: null,
    razorpaySignature: null,
    amountPaise: booking.totalAmountPaise,
    method: null,
    errorReason: null,
    refundId: null,
    refundedAt: null,
  });

  return {
    booking: await loadBooking(bookingId),
    checkout: {
      provider: order.provider,
      orderId: order.orderId,
      amountPaise: booking.totalAmountPaise,
      currency: "INR",
      keyId: order.keyId,
    },
  };
}

// ---------- Inventory release paths ----------

async function releaseInventory(booking: Booking, t: Transaction): Promise<void> {
  const items = await BookingItem.findAll({ where: { bookingId: booking.id }, transaction: t });
  for (const item of items) {
    const tt = await TicketType.findByPk(item.ticketTypeId, { transaction: t, lock: t.LOCK.UPDATE });
    if (tt) await tt.update({ quantitySold: Math.max(0, tt.quantitySold - item.quantity) }, { transaction: t });
  }
}

export async function expireBooking(bookingId: number): Promise<void> {
  await sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(bookingId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!booking || booking.status !== "pending") return;
    if (!booking.expiresAt || booking.expiresAt >= new Date()) return;
    await booking.update({ status: "expired", expiresAt: null }, { transaction: t });
    await releaseInventory(booking, t);
  });
}

/** Cron sweep — every minute (docs/03 §4). */
export async function expireStaleBookings(): Promise<number> {
  const stale = await Booking.findAll({
    where: { status: "pending", expiresAt: { [Op.lt]: new Date() } },
    attributes: ["id"],
  });
  for (const b of stale) await expireBooking(b.id);
  return stale.length;
}

// ---------- Confirmation (idempotent, keyed by order id — docs/03 §4) ----------

export async function confirmBookingByOrderId(
  orderId: string,
  paymentId: string,
  signature: string | null,
  method?: string,
): Promise<Booking> {
  const bookingId = await sequelize.transaction(async (t) => {
    const payment = await Payment.findOne({ where: { razorpayOrderId: orderId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!payment) throw new AppError(404, "NOT_FOUND", "Payment order not found");
    if (payment.status === "captured") return payment.bookingId; // idempotent replay → no-op

    const booking = await Booking.findByPk(payment.bookingId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");

    if (booking.status === "expired") {
      // Payment arrived after the hold lapsed — try to re-hold inventory (docs/03 §4)
      const items = await BookingItem.findAll({ where: { bookingId: booking.id }, transaction: t });
      for (const item of items) {
        const tt = await TicketType.findByPk(item.ticketTypeId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!tt || tt.quantitySold + item.quantity > tt.quantityTotal) {
          await payment.update(
            { status: "captured", razorpayPaymentId: paymentId, razorpaySignature: signature, errorReason: "captured_after_expiry_inventory_gone_refund_required", method: method ?? null },
            { transaction: t },
          );
          throw new AppError(409, "BOOKING_EXPIRED", "Booking expired and tickets are no longer available — a refund will be processed");
        }
      }
      for (const item of items) {
        const tt = (await TicketType.findByPk(item.ticketTypeId, { transaction: t, lock: t.LOCK.UPDATE }))!;
        await tt.update({ quantitySold: tt.quantitySold + item.quantity }, { transaction: t });
      }
    } else if (booking.status !== "pending") {
      throw new AppError(409, "INVALID_STATE", `Booking is already ${booking.status}`);
    }

    await payment.update(
      { status: "captured", razorpayPaymentId: paymentId, razorpaySignature: signature, method: method ?? null },
      { transaction: t },
    );
    await booking.update({ status: "confirmed", expiresAt: null }, { transaction: t });

    // Generate one signed ticket per admission unit (docs/03 §2.11)
    const items = await BookingItem.findAll({ where: { bookingId: booking.id }, transaction: t });
    const ticketRows = items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        bookingItemId: item.id,
        ticketCode: generateTicketCode(),
        checkedInAt: null,
        checkedInBy: null,
      })),
    );
    await Ticket.bulkCreate(ticketRows, { transaction: t });

    return booking.id;
  });

  const booking = await loadBooking(bookingId);
  if (booking.attendee && booking.event) {
    const tpl = bookingConfirmedEmail(booking.attendee.name, booking.event.title, booking.bookingNumber);
    sendEmailAsync({
      userId: booking.attendee.id,
      to: booking.attendee.email,
      type: "booking_confirmed",
      relatedType: "booking",
      relatedId: booking.id,
      ...tpl,
    });
  }
  return booking;
}

export async function markPaymentFailed(orderId: string, reason: string): Promise<void> {
  const payment = await Payment.findOne({ where: { razorpayOrderId: orderId } });
  if (!payment || payment.status === "captured") return;
  await payment.update({ status: "failed", errorReason: reason });
}

// ---------- Cancel ----------

export async function cancelBooking(bookingId: number, attendeeId: number): Promise<Booking> {
  await sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(bookingId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!booking || booking.attendeeId !== attendeeId) throw new AppError(404, "NOT_FOUND", "Booking not found");
    if (booking.status !== "confirmed") {
      throw new AppError(409, "INVALID_STATE", "Only confirmed bookings can be cancelled");
    }
    const event = await Event.findByPk(booking.eventId, { transaction: t });
    if (event && event.startTime <= new Date()) {
      throw new AppError(409, "INVALID_STATE", "The event has already started");
    }
    await booking.update({ status: "cancelled", cancelledAt: new Date() }, { transaction: t });
    await releaseInventory(booking, t);
    const items = await BookingItem.findAll({ where: { bookingId: booking.id }, attributes: ["id"], transaction: t });
    await Ticket.update(
      { status: "cancelled" },
      { where: { bookingItemId: { [Op.in]: items.map((i) => i.id) } }, transaction: t },
    );
  });

  const booking = await loadBooking(bookingId);
  if (booking.attendee && booking.event) {
    const tpl = bookingCancelledEmail(booking.attendee.name, booking.event.title, booking.bookingNumber);
    sendEmailAsync({
      userId: booking.attendee.id,
      to: booking.attendee.email,
      type: "booking_cancelled",
      relatedType: "booking",
      relatedId: booking.id,
      ...tpl,
    });
  }
  return booking;
}

// ---------- Reads ----------

export async function getBookingForViewer(
  bookingId: number,
  viewer: { id: number; role: string },
): Promise<{ booking: Booking; includeAttendee: boolean }> {
  let booking = await loadBooking(bookingId);
  booking = await expireIfStale(booking);

  const isOwner = booking.attendeeId === viewer.id;
  const isAdmin = viewer.role === "super_admin";
  const isEventOrganizer = booking.event?.organizerId === viewer.id;
  if (!isOwner && !isAdmin && !isEventOrganizer) throw new AppError(404, "NOT_FOUND", "Booking not found");
  return { booking, includeAttendee: isAdmin || isEventOrganizer };
}

export async function listMine(attendeeId: number, query: BookingListQuery): Promise<{ rows: Booking[]; meta: Meta }> {
  const where: WhereOptions = { attendeeId, ...(query.status ? { status: query.status } : {}) };
  const { rows, count } = await Booking.findAndCountAll({
    where,
    include: bookingInclude,
    order: [["createdAt", "DESC"]],
    distinct: true,
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

export async function listForEvent(
  eventId: number,
  organizerId: number,
  isAdmin: boolean,
  query: BookingListQuery,
): Promise<{ rows: Booking[]; meta: Meta }> {
  const event = await Event.findByPk(eventId);
  if (!event || (!isAdmin && event.organizerId !== organizerId)) {
    throw new AppError(404, "NOT_FOUND", "Event not found");
  }
  const where: WhereOptions = { eventId, ...(query.status ? { status: query.status } : {}) };
  const { rows, count } = await Booking.findAndCountAll({
    where,
    include: bookingInclude,
    order: [["createdAt", "DESC"]],
    distinct: true,
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

export async function listAll(query: BookingListQuery): Promise<{ rows: Booking[]; meta: Meta }> {
  const where: WhereOptions = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.eventId ? { eventId: query.eventId } : {}),
    ...(query.search ? { bookingNumber: { [Op.like]: `%${query.search}%` } } : {}),
  };
  const { rows, count } = await Booking.findAndCountAll({
    where,
    include: bookingInclude,
    order: [["createdAt", "DESC"]],
    distinct: true,
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}
