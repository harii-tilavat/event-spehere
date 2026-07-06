import { Router } from "express";
import { z } from "zod";
import {
  eventCreateSchema,
  eventListQuerySchema,
  eventRejectSchema,
  eventUpdateSchema,
  idParamSchema,
  ticketTypeCreateSchema,
  ticketTypeUpdateSchema,
} from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { optionalAuthenticate } from "@/middlewares/optional-authenticate.js";
import { authorize, requireApprovedOrganizer, requireVerifiedEmail } from "@/middlewares/authorize.js";
import * as event from "@/controllers/event.controller.js";
import * as ticketType from "@/controllers/ticket-type.controller.js";

const slugParamSchema = z.object({ slug: z.string().min(1).max(220) });
const eventIdParamSchema = z.object({ eventId: z.coerce.number().int().positive() });

export const eventRoutes = Router();

// Public catalog (docs/04 §7)
eventRoutes.get("/", validate({ query: eventListQuerySchema }), event.listPublic);

// Organizer lifecycle
const organizerGuard = [authenticate, authorize("organizer", "super_admin"), requireApprovedOrganizer, requireVerifiedEmail] as const;

eventRoutes.post("/", ...organizerGuard, validate({ body: eventCreateSchema }), event.create);
eventRoutes.patch("/:id", ...organizerGuard, validate({ params: idParamSchema, body: eventUpdateSchema }), event.update);
eventRoutes.delete("/:id", ...organizerGuard, validate({ params: idParamSchema }), event.remove);
eventRoutes.post("/:id/submit", ...organizerGuard, validate({ params: idParamSchema }), event.submit);
eventRoutes.post("/:id/cancel", ...organizerGuard, validate({ params: idParamSchema }), event.cancel);

// Admin approval workflow
eventRoutes.post("/:id/approve", authenticate, authorize("super_admin"), validate({ params: idParamSchema }), event.approve);
eventRoutes.post(
  "/:id/reject",
  authenticate,
  authorize("super_admin"),
  validate({ params: idParamSchema, body: eventRejectSchema }),
  event.reject,
);
eventRoutes.patch("/:id/feature", authenticate, authorize("super_admin"), validate({ params: idParamSchema }), event.toggleFeature);

// Ticket types nested under events (docs/04 §8)
eventRoutes.get("/:eventId/ticket-types", validate({ params: eventIdParamSchema }), ticketType.list);
eventRoutes.post(
  "/:eventId/ticket-types",
  ...organizerGuard,
  validate({ params: eventIdParamSchema, body: ticketTypeCreateSchema }),
  ticketType.create,
);

// Detail by slug LAST so it doesn't shadow the routes above
eventRoutes.get("/:slug", optionalAuthenticate, validate({ params: slugParamSchema }), event.detail);

export const ticketTypeRoutes = Router();
ticketTypeRoutes.patch(
  "/:id",
  ...organizerGuard,
  validate({ params: idParamSchema, body: ticketTypeUpdateSchema }),
  ticketType.update,
);
ticketTypeRoutes.delete("/:id", ...organizerGuard, validate({ params: idParamSchema }), ticketType.remove);
