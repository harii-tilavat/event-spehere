import { useGetAttendeeDashboard, useGetEvents, useGetWishlist } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { DASHBOARD_NAV } from "@/layouts/DashboardLayout/const";

export function useAttendeeDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useGetAttendeeDashboard();
  const wishlistQuery = useGetWishlist();
  const recommendedQuery = useGetEvents({});

  const upcomingBookings = dashboardQuery.data?.upcomingBookings ?? [];
  const wishlist = wishlistQuery.data ?? [];

  // Don't recommend what they've already booked or saved.
  const bookedEventIds = new Set(upcomingBookings.map((b) => b.event.id));
  const wishlistIds = new Set(wishlist.map((e) => e.id));
  const recommended = (recommendedQuery.data?.rows ?? [])
    .filter((e) => !bookedEventIds.has(e.id) && !wishlistIds.has(e.id))
    .slice(0, 3);

  return {
    user,
    isLoading: dashboardQuery.isPending,
    nextBooking: upcomingBookings[0] ?? null,
    laterBookings: upcomingBookings.slice(1, 4),
    totals: dashboardQuery.data?.totals ?? { confirmed: 0, attended: 0 },
    wishlistPreview: wishlist.slice(0, 3),
    wishlistCount: wishlist.length,
    recommended,
    isRecommendedLoading: recommendedQuery.isPending,
    quickLinks: DASHBOARD_NAV.attendee.filter((item) => !item.end),
  };
}
