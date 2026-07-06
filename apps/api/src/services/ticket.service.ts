import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Op } from "sequelize";
import { env } from "@/config/env.js";
import { AppError } from "@/utils/app-error.js";
import { hmacSha256, safeEqual } from "@/utils/crypto.js";
import { Booking, BookingItem, Event, Ticket, TicketType, User, Venue } from "@/models/index.js";
import { qrPayloadFor } from "@/services/booking.service.js";

interface LoadedTicket {
  ticket: Ticket;
  bookingItem: BookingItem;
  booking: Booking;
  event: Event;
  attendee: User;
}

async function loadTicketByCode(code: string): Promise<LoadedTicket> {
  const ticket = await Ticket.findOne({
    where: { ticketCode: code },
    include: [
      {
        model: BookingItem,
        as: "bookingItem",
        include: [
          { model: TicketType, as: "ticketType" },
          {
            model: Booking,
            as: "booking",
            paranoid: false,
            include: [
              { model: Event, as: "event", include: [{ model: Venue, as: "venue" }], paranoid: false },
              { model: User, as: "attendee", paranoid: false },
            ],
          },
        ],
      },
    ],
  });
  const bookingItem = ticket?.bookingItem as (BookingItem & { booking?: Booking }) | undefined;
  const booking = bookingItem?.booking;
  if (!ticket || !bookingItem || !booking?.event || !booking.attendee) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }
  return { ticket, bookingItem, booking, event: booking.event, attendee: booking.attendee };
}

// ---------- PDF (docs/04 §11) ----------

export async function ticketPdf(code: string, viewer: { id: number; role: string }): Promise<Buffer> {
  const { ticket, bookingItem, booking, event, attendee } = await loadTicketByCode(code);
  if (viewer.role !== "super_admin" && booking.attendeeId !== viewer.id) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }
  if (ticket.status === "cancelled") throw new AppError(409, "INVALID_STATE", "This ticket has been cancelled");

  const qrPng = await QRCode.toBuffer(qrPayloadFor(ticket.ticketCode), { width: 260, margin: 1 });

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A5", margin: 36 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header band
    doc.rect(0, 0, doc.page.width, 70).fill("#18181b");
    doc.fill("#fafafa").fontSize(20).font("Helvetica-Bold").text("EventSphere", 36, 26);
    doc.fontSize(10).font("Helvetica").text("E-TICKET", doc.page.width - 120, 32, { width: 84, align: "right" });

    doc.fill("#18181b").font("Helvetica-Bold").fontSize(16).text(event.title, 36, 96, { width: doc.page.width - 72 });
    doc
      .font("Helvetica")
      .fontSize(11)
      .fill("#3f3f46")
      .moveDown(0.5)
      .text(`${event.venue?.name ?? ""}, ${event.venue?.addressLine ?? ""}, ${event.venue?.city ?? ""}`)
      .moveDown(0.3)
      .text(
        event.startTime.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" }) +
          " IST",
      );

    const infoY = doc.y + 16;
    doc.font("Helvetica-Bold").fontSize(11).fill("#18181b");
    doc.text(`Ticket: ${bookingItem.ticketType?.name ?? "General"}`, 36, infoY);
    doc.text(`Attendee: ${attendee.name}`, 36, infoY + 18);
    doc.text(`Booking: ${booking.bookingNumber}`, 36, infoY + 36);
    doc.font("Helvetica").fontSize(10).fill("#3f3f46").text(`Code: ${ticket.ticketCode}`, 36, infoY + 56);

    doc.image(qrPng, doc.page.width - 176, infoY - 10, { width: 140 });

    doc
      .fontSize(8)
      .fill("#71717a")
      .text(
        "Present this QR code at the venue entrance. Each ticket admits one person and is valid for a single scan.",
        36,
        doc.page.height - 70,
        { width: doc.page.width - 72 },
      );

    doc.end();
  });
}

// ---------- Check-in (docs/08 §4: constant-time verify, single use) ----------

export interface CheckInResult {
  ticket: Ticket;
  attendeeName: string;
  eventTitle: string;
  ticketTypeName: string;
}

async function assertCanCheckIn(loaded: LoadedTicket, actor: { id: number; role: string }): Promise<void> {
  if (actor.role !== "super_admin" && loaded.event.organizerId !== actor.id) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }
  if (loaded.booking.status !== "confirmed") {
    throw new AppError(409, "INVALID_STATE", `Booking is ${loaded.booking.status} — ticket not admissible`);
  }
  if (!["published", "completed"].includes(loaded.event.status)) {
    throw new AppError(409, "INVALID_STATE", `Event is ${loaded.event.status}`);
  }
}

/** Atomic single-use transition: valid → checked_in exactly once (docs/08 §4). */
async function performCheckIn(loaded: LoadedTicket, actorId: number): Promise<CheckInResult> {
  const [affected] = await Ticket.update(
    { status: "checked_in", checkedInAt: new Date(), checkedInBy: actorId },
    { where: { id: loaded.ticket.id, status: "valid" } },
  );
  if (affected === 0) {
    const current = await Ticket.findByPk(loaded.ticket.id);
    if (current?.status === "checked_in") {
      throw new AppError(409, "ALREADY_CHECKED_IN", `Already checked in at ${current.checkedInAt?.toISOString()}`);
    }
    throw new AppError(409, "INVALID_STATE", "Ticket is not valid for entry");
  }
  const fresh = await Ticket.findByPk(loaded.ticket.id);
  return {
    ticket: fresh!,
    attendeeName: loaded.attendee.name,
    eventTitle: loaded.event.title,
    ticketTypeName: loaded.bookingItem.ticketType?.name ?? "Ticket",
  };
}

export async function checkInByQr(qrPayload: string, actor: { id: number; role: string }): Promise<CheckInResult> {
  const [code, signature] = qrPayload.trim().split(".");
  if (!code || !signature) throw new AppError(422, "VALIDATION_ERROR", "Malformed QR payload");
  if (!safeEqual(hmacSha256(code, env.QR_TICKET_SECRET), signature)) {
    throw new AppError(422, "PAYMENT_VERIFICATION_FAILED", "QR signature is invalid — possible forgery");
  }
  const loaded = await loadTicketByCode(code);
  await assertCanCheckIn(loaded, actor);
  return performCheckIn(loaded, actor.id);
}

/** Manual fallback: trusted organizer checks in by ticket code (docs/04 §11). */
export async function checkInByCode(ticketCode: string, actor: { id: number; role: string }): Promise<CheckInResult> {
  const loaded = await loadTicketByCode(ticketCode.trim().toUpperCase());
  await assertCanCheckIn(loaded, actor);
  return performCheckIn(loaded, actor.id);
}

export interface ManualLookupResult {
  booking: Booking;
  eventTitle: string;
  attendeeName: string;
}

export async function lookupBooking(bookingNumber: string, actor: { id: number; role: string }): Promise<ManualLookupResult> {
  const booking = await Booking.findOne({
    where: { bookingNumber: bookingNumber.trim().toUpperCase() },
    include: [
      { model: Event, as: "event", paranoid: false },
      { model: User, as: "attendee", paranoid: false },
      {
        model: BookingItem,
        as: "items",
        include: [
          { model: TicketType, as: "ticketType" },
          { model: Ticket, as: "tickets" },
        ],
      },
    ],
  });
  if (!booking || !booking.event) throw new AppError(404, "NOT_FOUND", "Booking not found");
  if (actor.role !== "super_admin" && booking.event.organizerId !== actor.id) {
    throw new AppError(404, "NOT_FOUND", "Booking not found");
  }
  return { booking, eventTitle: booking.event.title, attendeeName: booking.attendee?.name ?? "" };
}

// ---------- Attendance stats (docs/04 §11) ----------

export interface AttendanceStats {
  totalTickets: number;
  checkedIn: number;
  cancelled: number;
  rate: number;
  recent: { ticketCode: string; attendeeName: string; ticketTypeName: string; checkedInAt: string }[];
}

export async function attendanceForEvent(eventId: number, actor: { id: number; role: string }): Promise<AttendanceStats> {
  const event = await Event.findByPk(eventId);
  if (!event || (actor.role !== "super_admin" && event.organizerId !== actor.id)) {
    throw new AppError(404, "NOT_FOUND", "Event not found");
  }

  const items = await BookingItem.findAll({
    include: [
      { model: Booking, as: "booking", where: { eventId }, attributes: [], required: true },
    ],
    attributes: ["id"],
  });
  const itemIds = items.map((i) => i.id);
  if (itemIds.length === 0) return { totalTickets: 0, checkedIn: 0, cancelled: 0, rate: 0, recent: [] };

  const [totalTickets, checkedIn, cancelled] = await Promise.all([
    Ticket.count({ where: { bookingItemId: { [Op.in]: itemIds } } }),
    Ticket.count({ where: { bookingItemId: { [Op.in]: itemIds }, status: "checked_in" } }),
    Ticket.count({ where: { bookingItemId: { [Op.in]: itemIds }, status: "cancelled" } }),
  ]);

  const recentTickets = await Ticket.findAll({
    where: { bookingItemId: { [Op.in]: itemIds }, status: "checked_in" },
    order: [["checkedInAt", "DESC"]],
    limit: 10,
    include: [
      {
        model: BookingItem,
        as: "bookingItem",
        include: [
          { model: TicketType, as: "ticketType" },
          { model: Booking, as: "booking", include: [{ model: User, as: "attendee", paranoid: false }], paranoid: false },
        ],
      },
    ],
  });

  const admissible = totalTickets - cancelled;
  return {
    totalTickets,
    checkedIn,
    cancelled,
    rate: admissible > 0 ? Math.round((checkedIn / admissible) * 100) : 0,
    recent: recentTickets.map((t) => {
      const item = t.bookingItem as (BookingItem & { booking?: Booking }) | undefined;
      return {
        ticketCode: t.ticketCode,
        attendeeName: item?.booking?.attendee?.name ?? "",
        ticketTypeName: item?.ticketType?.name ?? "",
        checkedInAt: t.checkedInAt?.toISOString() ?? "",
      };
    }),
  };
}
