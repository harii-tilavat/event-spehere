import rateLimit from "express-rate-limit";
import type { ApiError } from "@eventsphere/shared";

const limitBody: ApiError = { success: false, message: "Too many requests, try again later", code: "RATE_LIMITED" };

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limitBody,
});
