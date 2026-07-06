import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { Badge, Card, CardContent } from "@eventsphere/ui";
import { formatDateTime, formatINR } from "@/lib/format";
import { eventImage } from "@/lib/images";
import type { EventCardProps } from "./types";

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/events/${event.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-colors group-hover:border-ring">
        <div className="relative aspect-[16/9] bg-secondary">
          <img src={eventImage(event)} alt="" className="size-full object-cover" loading="lazy" />
          {event.isFeatured && (
            <Badge className="absolute left-3 top-3" variant="default">
              <Star className="size-3" /> Featured
            </Badge>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <Badge variant="secondary">{event.categoryName}</Badge>
          <h3 className="line-clamp-2 font-semibold leading-snug">{event.title}</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" /> {formatDateTime(event.startTime)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {event.venueName}, {event.city}
          </p>
          <p className="pt-1 text-sm font-medium">
            {event.minPricePaise === null
              ? "Tickets TBA"
              : event.minPricePaise === 0
                ? "Free"
                : `From ${formatINR(event.minPricePaise)}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
