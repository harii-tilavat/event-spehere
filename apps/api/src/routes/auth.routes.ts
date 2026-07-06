import { Router } from "express";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { authLimiter } from "@/middlewares/rate-limit.js";
import * as auth from "@/controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validate({ body: registerSchema }), auth.register);
authRoutes.post("/login", authLimiter, validate({ body: loginSchema }), auth.login);
authRoutes.post("/refresh", auth.refresh);
authRoutes.post("/logout", auth.logout);
authRoutes.get("/me", authenticate, auth.me);
authRoutes.post("/verify-email", validate({ body: verifyEmailSchema }), auth.verifyEmail);
authRoutes.post("/resend-verification", authenticate, authLimiter, auth.resendVerification);
authRoutes.post("/forgot-password", authLimiter, validate({ body: forgotPasswordSchema }), auth.forgotPassword);
authRoutes.post("/reset-password", validate({ body: resetPasswordSchema }), auth.resetPassword);
authRoutes.post("/change-password", authenticate, validate({ body: changePasswordSchema }), auth.changePassword);
