import { Router } from "express";
import { mockCheckoutSchema, paginationQuerySchema, paymentVerifySchema, idParamSchema } from "@eventsphere/shared";
import { z } from "zod";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as payment from "@/controllers/payment.controller.js";

export const paymentRoutes = Router();

const paymentListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["created", "captured", "failed", "refunded"]).optional(),
});

paymentRoutes.post("/verify", authenticate, authorize("attendee"), validate({ body: paymentVerifySchema }), payment.verify);
paymentRoutes.post(
  "/mock-checkout",
  authenticate,
  authorize("attendee"),
  validate({ body: mockCheckoutSchema }),
  payment.mockCheckout,
);
paymentRoutes.get("/", authenticate, authorize("super_admin"), validate({ query: paymentListQuerySchema }), payment.list);
paymentRoutes.post("/:id/refund", authenticate, authorize("super_admin"), validate({ params: idParamSchema }), payment.refund);
