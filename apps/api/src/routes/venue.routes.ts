import { Router } from "express";
import { idParamSchema, paginationQuerySchema, venueCreateSchema, venueUpdateSchema } from "@eventsphere/shared";
import { z } from "zod";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as venue from "@/controllers/venue.controller.js";

const venueListQuery = paginationQuerySchema.extend({ city: z.string().trim().max(100).optional() });

export const venueRoutes = Router();

venueRoutes.get("/", validate({ query: venueListQuery }), venue.list);
venueRoutes.get("/:id", validate({ params: idParamSchema }), venue.detail);
venueRoutes.post("/", authenticate, authorize("super_admin"), validate({ body: venueCreateSchema }), venue.create);
venueRoutes.patch(
  "/:id",
  authenticate,
  authorize("super_admin"),
  validate({ params: idParamSchema, body: venueUpdateSchema }),
  venue.update,
);
venueRoutes.delete("/:id", authenticate, authorize("super_admin"), validate({ params: idParamSchema }), venue.remove);
