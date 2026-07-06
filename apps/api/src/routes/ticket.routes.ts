import { Router } from "express";
import { z } from "zod";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as ticket from "@/controllers/ticket.controller.js";

const codeParamSchema = z.object({ code: z.string().trim().min(8).max(32) });
const qrPayloadSchema = z.object({ qrPayload: z.string().trim().min(10).max(200) });
const ticketCodeSchema = z.object({ ticketCode: z.string().trim().min(8).max(32) });
const bookingNumberSchema = z.object({ bookingNumber: z.string().trim().min(6).max(20) });
const eventIdParamSchema = z.object({ eventId: z.coerce.number().int().positive() });

/** Attendee ticket downloads (docs/04 §11). */
export const ticketRoutes = Router();
ticketRoutes.get("/:code/pdf", authenticate, validate({ params: codeParamSchema }), ticket.pdf);

/** Organizer/admin check-in (docs/04 §11). */
export const checkInRoutes = Router();
checkInRoutes.use(authenticate, authorize("organizer", "super_admin"));
checkInRoutes.post("/", validate({ body: qrPayloadSchema }), ticket.checkIn);
checkInRoutes.post("/manual", validate({ body: bookingNumberSchema }), ticket.lookup);
checkInRoutes.post("/manual/ticket", validate({ body: ticketCodeSchema }), ticket.manualCheckIn);

/** Attendance stats nested under events. */
export const attendanceRoutes = Router();
attendanceRoutes.get(
  "/:eventId/attendance",
  authenticate,
  authorize("organizer", "super_admin"),
  validate({ params: eventIdParamSchema }),
  ticket.attendance,
);
