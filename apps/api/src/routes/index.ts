import { Router } from "express";
import { healthRoutes } from "@/routes/health.routes.js";
import { authRoutes } from "@/routes/auth.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
