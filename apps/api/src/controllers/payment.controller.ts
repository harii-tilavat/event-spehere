import type { PaginationQuery } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as paymentService from "@/services/payment.service.js";
import { toPaymentListItemDto } from "@/services/payment.service.js";
import { toBookingDto } from "@/services/booking.service.js";

export const verify = asyncHandler(async (req, res) => {
  const booking = await paymentService.verifyAndConfirm(req.user!.id, req.body);
  ok(res, "Payment verified — booking confirmed", { booking: toBookingDto(booking) });
});

export const mockCheckout = asyncHandler(async (req, res) => {
  const result = await paymentService.mockCheckout(req.user!.id, req.body.orderId, req.body.outcome);
  if (!result) {
    ok(res, "Payment declined (mock)", { declined: true });
    return;
  }
  ok(res, "Mock payment authorized — verify to confirm", result);
});

export const webhook = asyncHandler(async (req, res) => {
  await paymentService.handleWebhook(req.body as Buffer, req.headers["x-razorpay-signature"] as string | undefined);
  ok(res, "Webhook processed", null);
});

export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await paymentService.listPayments(req.query as unknown as PaginationQuery & { status?: string });
  ok(res, "Payments", { payments: rows.map(toPaymentListItemDto) }, { meta });
});

export const refund = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(Number(req.params.id));
  ok(res, "Payment refunded", { payment: toPaymentListItemDto(payment) });
});
