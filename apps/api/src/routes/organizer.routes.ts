import { Router } from "express";
import {
  idParamSchema,
  organizerDecisionSchema,
  organizerListQuerySchema,
  organizerProfileUpdateSchema,
} from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as organizer from "@/controllers/organizer.controller.js";

export const organizerRoutes = Router();

organizerRoutes.use(authenticate);

organizerRoutes.get("/me", authorize("organizer"), organizer.me);
organizerRoutes.patch("/me", authorize("organizer"), validate({ body: organizerProfileUpdateSchema }), organizer.updateMe);

organizerRoutes.get("/", authorize("super_admin"), validate({ query: organizerListQuerySchema }), organizer.list);
organizerRoutes.get("/:id", authorize("super_admin"), validate({ params: idParamSchema }), organizer.detail);
organizerRoutes.patch(
  "/:id/approval",
  authorize("super_admin"),
  validate({ params: idParamSchema, body: organizerDecisionSchema }),
  organizer.decide,
);
