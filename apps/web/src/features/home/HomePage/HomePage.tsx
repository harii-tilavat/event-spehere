import { CategoryStrip, CtaBand, EventRail, HeroSection, HowItWorks } from "./components";
import { useHomePage } from "./useHomePage";

export function HomePage() {
  const { featured, upcoming, categories, isFeaturedLoading, isUpcomingLoading, isCategoriesLoading } = useHomePage();

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <HeroSection />

      <EventRail
        title="Featured events"
        description="Hand-picked highlights you won't want to miss"
        events={featured}
        isLoading={isFeaturedLoading}
        viewAllHref="/events?featured=true"
      />

      <CategoryStrip categories={categories} isLoading={isCategoriesLoading} />

      <EventRail
        title="Upcoming events"
        description="Fresh on the calendar"
        events={upcoming}
        isLoading={isUpcomingLoading}
        viewAllHref="/events"
        emptyMessage="No published events yet — check back soon."
      />

      <HowItWorks />
      <CtaBand />
    </div>
  );
}
