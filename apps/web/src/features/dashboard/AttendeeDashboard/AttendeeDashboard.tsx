import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarPlus, Heart, Ticket } from "lucide-react";
import { Badge, Button, Card, CardContent, PageHeader } from "@eventsphere/ui";
import { EventCard } from "@/features/events/EventsPage/components";
import { StatCard } from "@/features/dashboard/DashboardHomePage/components";
import { formatDateTime } from "@/lib/format";
import { useAttendeeDashboard } from "./useAttendeeDashboard";
import { NextEventCard } from "./components";

export function AttendeeDashboard() {
  const {
    user,
    isLoading,
    nextBooking,
    laterBookings,
    totals,
    wishlistPreview,
    wishlistCount,
    recommended,
    isRecommendedLoading,
    quickLinks,
  } = useAttendeeDashboard();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Your tickets, saved events, and picks for you" />

      {/* Next event hero, or an empty-state nudge */}
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-2xl border bg-card" />
      ) : nextBooking ? (
        <NextEventCard booking={nextBooking} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Ticket className="size-8 text-muted-foreground" />
            <p className="font-medium">No upcoming events yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Discover concerts, conferences, and more — book your first ticket in seconds.
            </p>
            <Button asChild>
              <Link to="/events">Browse events</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming bookings" value={String(totals.confirmed)} icon={Ticket} />
        <StatCard label="Events attended" value={String(totals.attended)} icon={BadgeCheck} />
        <StatCard label="Saved to wishlist" value={String(wishlistCount)} icon={Heart} />
      </div>

      {/* More upcoming bookings */}
      {laterBookings.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">More upcoming bookings</h2>
            <Link to="/account/bookings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              All bookings <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {laterBookings.map((b) => (
              <Link key={b.id} to={`/account/bookings/${b.id}`} className="block">
                <Card className="transition-colors hover:border-ring">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{b.event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(b.event.startTime)} · {b.event.venueName}
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0 capitalize">
                      {b.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Wishlist preview */}
      {wishlistPreview.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">From your wishlist</h2>
            <Link to="/account/wishlist" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistPreview.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {(isRecommendedLoading || recommended.length > 0) && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended for you</h2>
            <Link to="/events" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Explore all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isRecommendedLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl border bg-card" />
                ))
              : recommended.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-colors group-hover:border-ring">
              <CardContent className="flex items-center justify-between p-4">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Icon className="size-5 text-primary" /> {label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
        <Link to="/events" className="group">
          <Card className="h-full transition-colors group-hover:border-ring">
            <CardContent className="flex items-center justify-between p-4">
              <span className="flex items-center gap-3 text-sm font-medium">
                <CalendarPlus className="size-5 text-primary" /> Browse events
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
