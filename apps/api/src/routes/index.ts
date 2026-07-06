import { Router } from "express";
import { healthRoutes } from "@/routes/health.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
// Phase 1+: auth, users, organizers, categories, venues, events, bookings, payments, ...
