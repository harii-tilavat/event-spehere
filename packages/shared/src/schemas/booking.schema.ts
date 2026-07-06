import { z } from "zod";
import { paginationQuerySchema } from "./common.schema.js";

export const bookingCreateSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  items: z
    .array(
      z.object({
        ticketTypeId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(50),
      }),
    )
    .min(1, "Pick at least one ticket")
    .max(5),
});
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "confirmed", "cancelled", "expired", "refunded"]).optional(),
  eventId: z.coerce.number().int().positive().optional(),
});
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;

export const paymentVerifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>;

export const mockCheckoutSchema = z.object({
  orderId: z.string().min(1),
  outcome: z.enum(["success", "failure"]),
});
export type MockCheckoutInput = z.infer<typeof mockCheckoutSchema>;
