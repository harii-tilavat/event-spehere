import { Link } from "react-router-dom";
import { CalendarDays, Heart, MapPin, X } from "lucide-react";
import { Badge, Button, Card, CardContent, PageHeader } from "@eventsphere/ui";
import { QueryError } from "@/components";
import { formatDateTime, formatINR } from "@/lib/format";
import { useWishlistPage } from "./useWishlistPage";

export function WishlistPage() {
  const { events, isLoading, isError, error, refetch, isRemoving, handleRemove } = useWishlistPage();

  if (isError) {
    return (
      <div>
        <PageHeader title="Wishlist" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Wishlist" description="Events you saved for later" />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border bg-card" />
          ))}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Heart className="size-8" />
            <p>Nothing saved yet.</p>
            <Button asChild variant="outline">
              <Link to="/events">Browse events</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <Link to={`/events/${e.slug}`} className="min-w-0 flex-1">
                <p className="truncate font-medium hover:underline">{e.title}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" /> {formatDateTime(e.startTime)}
                  <MapPin className="ml-2 size-3.5" /> {e.venueName}, {e.city}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">
                  {e.minPricePaise === null ? "TBA" : e.minPricePaise === 0 ? "Free" : `From ${formatINR(e.minPricePaise)}`}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isRemoving}
                  onClick={() => handleRemove(e.id)}
                  aria-label={`Remove ${e.title} from wishlist`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
