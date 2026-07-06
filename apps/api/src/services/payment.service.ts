import { Op, type WhereOptions } from "sequelize";
import type { Meta, PaginationQuery, PaymentListItemDto, PaymentVerifyInput } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";
import { Booking, BookingItem, Event, Payment, Ticket, TicketType, User } from "@/models/index.js";
import {
  computeSignature,
  isMockMode,
  verifySignature,
  verifyWebhookSignature,
} from "@/services/payment-provider.js";
import * as bookingService from "@/services/booking.service.js";

export function toPaymentListItemDto(p: Payment & { booking?: Booking }): PaymentListItemDto {
  return {
    id: p.id,
    bookingId: p.bookingId,
    bookingNumber: p.booking?.bookingNumber ?? "",
    eventTitle: p.booking?.event?.title ?? "",
    attendeeEmail: p.booking?.attendee?.email ?? "",
    orderId: p.razorpayOrderId,
    paymentId: p.razorpayPaymentId,
    amountPaise: p.amountPaise,
    status: p.status,
    method: p.method,
    errorReason: p.errorReason,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Client callback path — server-side signature verification (docs/08 §3). */
export async function verifyAndConfirm(attendeeId: number, input: PaymentVerifyInput): Promise<Booking> {
  const payment = await Payment.findOne({
    where: { razorpayOrderId: input.razorpayOrderId },
    include: [{ model: Booking, as: "booking" }],
  });
  if (!payment || payment.booking?.attendeeId !== attendeeId) {
    throw new AppError(404, "NOT_FOUND", "Payment order not found");
  }

  if (!verifySignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)) {
    await bookingService.markPaymentFailed(input.razorpayOrderId, "signature_verification_failed");
    throw new AppError(422, "PAYMENT_VERIFICATION_FAILED", "Payment could not be verified");
  }

  return bookingService.confirmBookingByOrderId(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  );
}

/**
 * Mock checkout (docs/10 §1 fallback): simulates Razorpay's checkout result so the
 * real verification path is exercised end-to-end without gateway credentials.
 * Only available in mock mode; the returned signature is computed with the same
 * HMAC the verify endpoint checks.
 */
export async function mockCheckout(
  attendeeId: number,
  orderId: string,
  outcome: "success" | "failure",
): Promise<{ razorpayPaymentId: string; razorpaySignature: string } | null> {
  if (!isMockMode()) throw new AppError(404, "NOT_FOUND", "Mock checkout is disabled when Razorpay is configured");

  const payment = await Payment.findOne({
    where: { razorpayOrderId: orderId },
    include: [{ model: Booking, as: "booking" }],
  });
  if (!payment || payment.booking?.attendeeId !== attendeeId) {
    throw new AppError(404, "NOT_FOUND", "Payment order not found");
  }

  if (outcome === "failure") {
    await bookingService.markPaymentFailed(orderId, "mock_payment_declined");
    return null;
  }

  const paymentId = `pay_mock_${payment.id}_${Date.now().toString(36)}`;
  return { razorpayPaymentId: paymentId, razorpaySignature: computeSignature(orderId, paymentId) };
}

/** Webhook path — source of truth when Razorpay is configured (docs/05 §3). */
export async function handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody.toString()) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string; method?: string; error_description?: string } } };
  };
  const entity = payload.payload?.payment?.entity;
  if (!entity) return;

  if (payload.event === "payment.captured") {
    await bookingService.confirmBookingByOrderId(entity.order_id, entity.id, null, entity.method);
  } else if (payload.event === "payment.failed") {
    await bookingService.markPaymentFailed(entity.order_id, entity.error_description ?? "payment_failed");
  }
}

export async function listPayments(
  query: PaginationQuery & { status?: string },
): Promise<{ rows: Payment[]; meta: Meta }> {
  const where: WhereOptions = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { razorpayOrderId: { [Op.like]: `%${query.search}%` } } : {}),
  };
  const { rows, count } = await Payment.findAndCountAll({
    where,
    include: [
      {
        model: Booking,
        as: "booking",
        paranoid: false,
        include: [
          { model: Event, as: "event", paranoid: false },
          { model: User, as: "attendee", paranoid: false },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

/** Admin refund (docs/04 §10) — Razorpay refund API in real mode, local in mock mode. */
export async function refundPayment(paymentId: number): Promise<Payment> {
  const payment = await Payment.findByPk(paymentId, { include: [{ model: Booking, as: "booking" }] });
  if (!payment) throw new AppError(404, "NOT_FOUND", "Payment not found");
  if (payment.status !== "captured") {
    throw new AppError(409, "INVALID_STATE", "Only captured payments can be refunded");
  }

  let refundId = `rfnd_mock_${payment.id}_${Date.now().toString(36)}`;
  if (!isMockMode() && payment.razorpayPaymentId) {
    const { env } = await import("@/config/env.js");
    const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount: payment.amountPaise }),
    });
    if (!res.ok) throw new AppError(502, "INTERNAL_ERROR", "Refund failed at the payment gateway");
    refundId = ((await res.json()) as { id: string }).id;
  }

  await sequelize.transaction(async (t) => {
    await payment.update({ status: "refunded", refundId, refundedAt: new Date() }, { transaction: t });
    const booking = await Booking.findByPk(payment.bookingId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!booking) return;

    const wasHoldingInventory = booking.status === "confirmed";
    await booking.update({ status: "refunded" }, { transaction: t });

    const items = await BookingItem.findAll({ where: { bookingId: booking.id }, transaction: t });
    await Ticket.update(
      { status: "cancelled" },
      { where: { bookingItemId: { [Op.in]: items.map((i) => i.id) } }, transaction: t },
    );
    if (wasHoldingInventory) {
      for (const item of items) {
        const tt = await TicketType.findByPk(item.ticketTypeId, { transaction: t, lock: t.LOCK.UPDATE });
        if (tt) await tt.update({ quantitySold: Math.max(0, tt.quantitySold - item.quantity) }, { transaction: t });
      }
    }
  });

  return payment;
}
