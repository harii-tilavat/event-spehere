import { useAuth } from "@/context/AuthContext";
import { DASHBOARD_NAV } from "@/layouts/DashboardLayout/const";

export function useDashboardHomePage() {
  const { user } = useAuth();

  const quickLinks = user ? DASHBOARD_NAV[user.role].filter((item) => !item.end) : [];
  const organizerStatus = user?.organizerProfile?.approvalStatus;
  const isPendingOrganizer = user?.role === "organizer" && organizerStatus !== "approved";

  return {
    user,
    quickLinks,
    isPendingOrganizer,
    organizerStatus,
    rejectionReason: user?.organizerProfile?.rejectionReason ?? null,
  };
}
