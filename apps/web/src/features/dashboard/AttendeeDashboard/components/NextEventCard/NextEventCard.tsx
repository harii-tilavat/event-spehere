import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import { Badge, Button } from "@eventsphere/ui";
import { eventImage } from "@/lib/images";
import { formatDateTime, relativeDay } from "@/lib/format";
import type { NextEventCardProps } from "./types";

export function NextEventCard({ booking }: NextEventCardProps) {
  const { event } = booking;

  return (
    <div className="relative overflow-hidden rounded-2xl border">
      <img src={eventImage(event)} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />

      <div className="relative flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Your next event</Badge>
          <Badge variant="success">
            <Clock className="size-3" /> {relativeDay(event.startTime)}
          </Badge>
        </div>

        <h2 className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h2>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4" /> {formatDateTime(event.startTime)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4" /> {event.venueName}, {event.city}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={`/account/bookings/${booking.id}`}>
              <Ticket className="size-4" /> View ticket
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/events/${event.slug}`}>Event details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
