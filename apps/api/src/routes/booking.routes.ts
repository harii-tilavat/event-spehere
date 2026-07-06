import { Router } from "express";
import { z } from "zod";
import { bookingCreateSchema, bookingListQuerySchema, idParamSchema } from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize, requireVerifiedEmail } from "@/middlewares/authorize.js";
import * as booking from "@/controllers/booking.controller.js";

export const bookingRoutes = Router();

bookingRoutes.use(authenticate);

bookingRoutes.post("/", authorize("attendee"), requireVerifiedEmail, validate({ body: bookingCreateSchema }), booking.create);
bookingRoutes.get("/me", authorize("attendee"), validate({ query: bookingListQuerySchema }), booking.listMine);
bookingRoutes.get("/:id", validate({ params: idParamSchema }), booking.detail);
bookingRoutes.post("/:id/cancel", authorize("attendee"), validate({ params: idParamSchema }), booking.cancel);

/** Organizer view: bookings for one of their events (docs/04 §7). */
export const eventBookingRoutes = Router();
const eventIdParamSchema = z.object({ eventId: z.coerce.number().int().positive() });
eventBookingRoutes.get(
  "/:eventId/bookings",
  authenticate,
  authorize("organizer", "super_admin"),
  validate({ params: eventIdParamSchema, query: bookingListQuerySchema }),
  booking.listForEvent,
);

/** Admin monitoring (docs/04 §9). */
export const adminBookingRoutes = Router();
adminBookingRoutes.get(
  "/bookings",
  authenticate,
  authorize("super_admin"),
  validate({ query: bookingListQuerySchema }),
  booking.listAll,
);
