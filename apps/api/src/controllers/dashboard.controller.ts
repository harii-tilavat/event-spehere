import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as dashboardService from "@/services/dashboard.service.js";
import type { DashboardRange } from "@/services/dashboard.service.js";

function parseRange(value: unknown): DashboardRange {
  return value === "7d" || value === "90d" || value === "all" ? value : "30d";
}

export const admin = asyncHandler(async (req, res) => {
  ok(res, "Admin dashboard", await dashboardService.adminDashboard(parseRange(req.query.range)));
});

export const organizer = asyncHandler(async (req, res) => {
  ok(res, "Organizer dashboard", await dashboardService.organizerDashboard(req.user!.id, parseRange(req.query.range)));
});

export const attendee = asyncHandler(async (req, res) => {
  ok(res, "Attendee dashboard", await dashboardService.attendeeDashboard(req.user!.id));
});
