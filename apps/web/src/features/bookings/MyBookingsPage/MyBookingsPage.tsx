import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Ticket } from "lucide-react";
import type { BookingStatus } from "@eventsphere/shared";
import { Badge, Button, Card, CardContent, PageHeader } from "@eventsphere/ui";
import { QueryError } from "@/components";
import { formatDateTime, formatINR } from "@/lib/format";
import { useMyBookingsPage } from "./useMyBookingsPage";

const statusVariant: Record<BookingStatus, "success" | "secondary" | "destructive" | "outline"> = {
  confirmed: "success",
  pending: "outline",
  cancelled: "destructive",
  expired: "secondary",
  refunded: "secondary",
};

export function MyBookingsPage() {
  const { bookings, meta, isLoading, isError, error, refetch, setPage } = useMyBookingsPage();

  if (isError) {
    return (
      <div>
        <PageHeader title="My bookings" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My bookings" description="Your ticket orders across all events" />

      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border bg-card" />)}

        {!isLoading && bookings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
              <Ticket className="size-8" />
              <p>No bookings yet.</p>
              <Button asChild variant="outline">
                <Link to="/events">Browse events</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {bookings.map((b) => (
          <Link key={b.id} to={`/account/bookings/${b.id}`} className="block">
            <Card className="transition-colors hover:border-ring">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.event.title}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {formatDateTime(b.event.startTime)} · {b.event.venueName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.bookingNumber} · {formatINR(b.totalAmountPaise)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={statusVariant[b.status]} className="capitalize">
                    {b.status}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
