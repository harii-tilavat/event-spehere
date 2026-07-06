import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as dashboard from "@/controllers/dashboard.controller.js";
import * as report from "@/controllers/report.controller.js";

export const dashboardRoutes = Router();
dashboardRoutes.use(authenticate);
dashboardRoutes.get("/admin", authorize("super_admin"), dashboard.admin);
dashboardRoutes.get("/organizer", authorize("organizer", "super_admin"), dashboard.organizer);
dashboardRoutes.get("/attendee", authorize("attendee"), dashboard.attendee);

export const reportRoutes = Router();
reportRoutes.use(authenticate, authorize("organizer", "super_admin"));
reportRoutes.get("/revenue", report.revenue);
reportRoutes.get("/bookings", report.bookings);
reportRoutes.get("/attendance", report.attendance);
