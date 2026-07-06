import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env, isProd } from "@/config/env.js";
import { apiRouter } from "@/routes/index.js";
import { UPLOADS_DIR } from "@/services/upload.service.js";
import { webhook as paymentWebhook } from "@/controllers/payment.controller.js";
import { apiLimiter } from "@/middlewares/rate-limit.js";
import { errorHandler, notFoundHandler } from "@/middlewares/error-handler.js";

export function createApp(): express.Express {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

  // Razorpay webhook BEFORE the JSON parser — its signature is computed over the
  // raw body (docs/07 §2)
  app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), paymentWebhook);

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(apiLimiter);
  app.use(morgan(isProd ? "combined" : "dev"));

  // Local-disk image fallback when Cloudinary is not configured (docs/10 §1)
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d", immutable: true }));

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
