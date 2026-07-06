import { Router } from "express";
import { eventStatusFilterSchema } from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as event from "@/controllers/event.controller.js";

/** GET /admin/events — all events with status filter (approval queue = pending_approval). */
export const adminEventRoutes = Router();

adminEventRoutes.get(
  "/events",
  authenticate,
  authorize("super_admin"),
  validate({ query: eventStatusFilterSchema }),
  event.listAdmin,
);
