import { useState } from "react";
import { useGetAdminDashboard, useGetOrganizerDashboard, type DashboardRange } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { DASHBOARD_NAV } from "@/layouts/DashboardLayout/const";

// Attendees get a bespoke dashboard (AttendeeDashboard); this hook drives admin + organizer.
export function useDashboardHomePage() {
  const { user } = useAuth();
  const [range, setRange] = useState<DashboardRange>("30d");

  const role = user?.role;
  const adminQuery = useGetAdminDashboard(range, role === "super_admin");
  const organizerQuery = useGetOrganizerDashboard(range, role === "organizer");

  const quickLinks = user ? DASHBOARD_NAV[user.role].filter((item) => !item.end) : [];
  const organizerStatus = user?.organizerProfile?.approvalStatus;
  const isPendingOrganizer = user?.role === "organizer" && organizerStatus !== "approved";

  return {
    user,
    range,
    setRange,
    quickLinks,
    isPendingOrganizer,
    organizerStatus,
    rejectionReason: user?.organizerProfile?.rejectionReason ?? null,
    admin: adminQuery.data,
    organizer: organizerQuery.data,
    isLoadingStats:
      (role === "super_admin" && adminQuery.isPending) ||
      (role === "organizer" && !isPendingOrganizer && organizerQuery.isPending),
  };
}
