import { Link } from "react-router-dom";
import { CalendarDays, ExternalLink, Heart, MapPin, Ticket, Users } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@eventsphere/ui";
import { QueryError } from "@/components";
import { EventStatusBadge } from "@/components/EventStatusBadge/EventStatusBadge";
import { formatDateTime, formatINR } from "@/lib/format";
import { eventImage } from "@/lib/images";
import { useAuth } from "@/context/AuthContext";
import { ReviewsSection } from "./components";
import { useEventDetailPage } from "./useEventDetailPage";

export function EventDetailPage() {
  const {
    event,
    isLoading,
    isError,
    error,
    refetch,
    isBookable,
    isAttendee,
    inWishlist,
    isTogglingWishlist,
    handleToggleWishlist,
  } = useEventDetailPage();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
        <div className="aspect-[21/9] animate-pulse rounded-2xl bg-card" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-card" />
        <div className="h-32 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  const mapsUrl =
    event.venue.latitude !== null && event.venue.longitude !== null
      ? `https://www.google.com/maps?q=${event.venue.latitude},${event.venue.longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(`${event.venue.name} ${event.venue.city}`)}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-2xl border bg-secondary">
        <img src={eventImage(event)} alt="" className="size-full object-cover" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{event.categoryName}</Badge>
        {event.status !== "published" && <EventStatusBadge status={event.status} />}
        {event.isFeatured && <Badge>Featured</Badge>}
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
        {isAttendee && (
          <Button
            variant="outline"
            size="icon"
            disabled={isTogglingWishlist}
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("size-4", inWishlist && "fill-destructive text-destructive")} />
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>

          {event.galleryImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {event.galleryImages.map((url) => (
                  <img key={url} src={url} alt="" className="aspect-square rounded-lg border object-cover" loading="lazy" />
                ))}
              </CardContent>
            </Card>
          )}

          <ReviewsSection eventId={event.id} organizerId={event.organizer.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <span>
                  {formatDateTime(event.startTime)} — {formatDateTime(event.endTime)}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <span>
                  {event.venue.name}, {event.venue.addressLine}, {event.venue.city}
                </span>
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4"
              >
                Open in Google Maps <ExternalLink className="size-3" />
              </a>
              <p className="flex items-center gap-2">
                <Users className="size-4 text-primary" /> Capacity {event.capacity.toLocaleString()}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                Hosted by <span className="font-medium text-foreground">{event.organizer.organizationName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Registration closes {formatDateTime(event.registrationDeadline)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="size-4" /> Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.ticketTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">Ticket details coming soon.</p>
              )}
              {event.ticketTypes.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.isOnSale ? `${t.remaining} left` : t.remaining === 0 ? "Sold out" : "Not on sale"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{t.pricePaise === 0 ? "Free" : formatINR(t.pricePaise)}</p>
                </div>
              ))}

              {isBookable && (!user || user.role === "attendee") && (
                <Button asChild className="w-full">
                  <Link to={`/events/${event.slug}/book`}>Book tickets</Link>
                </Button>
              )}
              {isBookable && user && user.role === "attendee" && !user.isEmailVerified && (
                <p className="text-xs text-yellow-500">Verify your email to book tickets.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
