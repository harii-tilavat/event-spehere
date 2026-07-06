import { Router } from "express";
import { categoryCreateSchema, categoryUpdateSchema, idParamSchema } from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import { optionalAuthenticate } from "@/middlewares/optional-authenticate.js";
import * as category from "@/controllers/category.controller.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", optionalAuthenticate, category.list);
categoryRoutes.post("/", authenticate, authorize("super_admin"), validate({ body: categoryCreateSchema }), category.create);
categoryRoutes.patch(
  "/:id",
  authenticate,
  authorize("super_admin"),
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  category.update,
);
categoryRoutes.delete("/:id", authenticate, authorize("super_admin"), validate({ params: idParamSchema }), category.remove);
