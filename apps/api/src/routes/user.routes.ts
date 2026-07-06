import { Router } from "express";
import { idParamSchema, updateProfileSchema, userListQuerySchema, userStatusSchema } from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as user from "@/controllers/user.controller.js";

export const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.patch("/me", validate({ body: updateProfileSchema }), user.updateMe);

userRoutes.get("/", authorize("super_admin"), validate({ query: userListQuerySchema }), user.list);
userRoutes.get("/:id", authorize("super_admin"), validate({ params: idParamSchema }), user.detail);
userRoutes.patch(
  "/:id/status",
  authorize("super_admin"),
  validate({ params: idParamSchema, body: userStatusSchema }),
  user.setStatus,
);
userRoutes.delete("/:id", authorize("super_admin"), validate({ params: idParamSchema }), user.remove);
