import { Router } from "express";
import { healthRoutes } from "@/routes/health.routes.js";
import { authRoutes } from "@/routes/auth.routes.js";
import { categoryRoutes } from "@/routes/category.routes.js";
import { venueRoutes } from "@/routes/venue.routes.js";
import { userRoutes } from "@/routes/user.routes.js";
import { organizerRoutes } from "@/routes/organizer.routes.js";
import { uploadRoutes } from "@/routes/upload.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/venues", venueRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/organizers", organizerRoutes);
apiRouter.use("/uploads", uploadRoutes);
