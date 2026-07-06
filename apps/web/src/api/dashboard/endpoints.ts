import { buildKey, type QueryEndpoint } from "@/api/core";
import { dashboardPaths } from "./paths";
import type { DashboardRange } from "./types";

export const queryEndpoints = {
  getAdminDashboard: (range?: DashboardRange): QueryEndpoint => ({
    url: dashboardPaths.admin(),
    queryKey: buildKey("dashboard", "admin", range),
  }),
  getOrganizerDashboard: (range?: DashboardRange): QueryEndpoint => ({
    url: dashboardPaths.organizer(),
    queryKey: buildKey("dashboard", "organizer", range),
  }),
  getAttendeeDashboard: (): QueryEndpoint => ({
    url: dashboardPaths.attendee(),
    queryKey: buildKey("dashboard", "attendee"),
  }),
};
