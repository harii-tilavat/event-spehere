import { Router } from "express";
import { eventStatusFilterSchema } from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize, requireApprovedOrganizer } from "@/middlewares/authorize.js";
import * as event from "@/controllers/event.controller.js";

/** GET /organizer/events — the organizer's own events, any status (docs/04 §7). */
export const organizerEventRoutes = Router();

organizerEventRoutes.get(
  "/events",
  authenticate,
  authorize("organizer", "super_admin"),
  requireApprovedOrganizer,
  validate({ query: eventStatusFilterSchema }),
  event.listMine,
);
