import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { EventCard } from "@/features/events/EventsPage/components";
import type { EventRailProps } from "./types";

export function EventRail({ title, description, events, isLoading, viewAllHref, emptyMessage }: EventRailProps) {
  if (!isLoading && events.length === 0) {
    if (!emptyMessage) return null;
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border bg-card" />
            ))
          : events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  );
}
