import rateLimit from "express-rate-limit";
import type { ApiError } from "@eventsphere/shared";
import { isProd } from "@/config/env.js";

const limitBody: ApiError = { success: false, message: "Too many requests, try again later", code: "RATE_LIMITED" };

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 300 : 3000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limitBody,
});

/** Sensitive auth endpoints: login, register, forgot-password, resend-verification (docs/08 §1). */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: isProd ? 5 : 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limitBody,
});
