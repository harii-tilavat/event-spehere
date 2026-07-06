import { useGetCategories, useGetEvents } from "@/api";

const FEATURED_LIMIT = 3;
const UPCOMING_LIMIT = 6;

export function useHomePage() {
  const featuredQuery = useGetEvents({ featured: true });
  // default API sort surfaces featured first, then soonest start — good enough for "upcoming"
  const upcomingQuery = useGetEvents({});
  const categoriesQuery = useGetCategories();

  const featured = (featuredQuery.data?.rows ?? []).slice(0, FEATURED_LIMIT);
  const featuredIds = new Set(featured.map((e) => e.id));
  const upcoming = (upcomingQuery.data?.rows ?? [])
    .filter((e) => !featuredIds.has(e.id))
    .slice(0, UPCOMING_LIMIT);

  return {
    featured,
    upcoming,
    categories: categoriesQuery.data ?? [],
    isFeaturedLoading: featuredQuery.isPending,
    isUpcomingLoading: upcomingQuery.isPending,
    isCategoriesLoading: categoriesQuery.isPending,
  };
}
