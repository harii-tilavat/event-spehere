import { Link } from "react-router-dom";
import { Ban, CalendarDays, Download, MapPin } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, ConfirmDialog, PageHeader } from "@eventsphere/ui";
import { QrCode, QueryError } from "@/components";
import { formatDateTime, formatINR } from "@/lib/format";
import { useBookingDetailPage } from "./useBookingDetailPage";

export function BookingDetailPage() {
  const {
    booking,
    isLoading,
    isError,
    error,
    refetch,
    canCancel,
    cancelOpen,
    setCancelOpen,
    isCancelling,
    handleCancel,
    handleDownloadTicket,
  } = useBookingDetailPage();

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl border bg-card" />;
  if (isError || !booking) {
    return <QueryError error={error} onRetry={refetch} />;
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={booking.event.title}
        description={`${booking.bookingNumber} · booked ${formatDateTime(booking.createdAt)}`}
        actions={
          <Badge className="capitalize" variant={booking.status === "confirmed" ? "success" : "secondary"}>
            {booking.status}
          </Badge>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" /> {formatDateTime(booking.event.startTime)}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" /> {booking.event.venueName}, {booking.event.city}
            </p>
            <Link to={`/events/${booking.event.slug}`} className="text-xs underline underline-offset-4">
              View event
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {booking.items.map((i) => (
              <p key={i.id} className="flex justify-between text-muted-foreground">
                <span>
                  {i.quantity} × {i.ticketTypeName}
                </span>
                <span>{formatINR(i.subtotalPaise)}</span>
              </p>
            ))}
            <p className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatINR(booking.totalAmountPaise)}</span>
            </p>
            {booking.payment && (
              <p className="pt-1 text-xs text-muted-foreground">
                Payment {booking.payment.status} · order {booking.payment.orderId}
              </p>
            )}
          </CardContent>
        </Card>

        {booking.tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your tickets</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {booking.tickets.map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-2 rounded-xl border p-4">
                  <QrCode value={t.qrPayload} size={150} />
                  <p className="font-mono text-xs">{t.ticketCode}</p>
                  <p className="text-xs text-muted-foreground">{t.ticketTypeName}</p>
                  <Badge className="capitalize" variant={t.status === "valid" ? "success" : t.status === "checked_in" ? "secondary" : "destructive"}>
                    {t.status.replace("_", " ")}
                  </Badge>
                  {t.status !== "cancelled" && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadTicket(t.ticketCode)}>
                      <Download className="size-4" /> PDF
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {canCancel && (
          <Button variant="outline" onClick={() => setCancelOpen(true)}>
            <Ban className="size-4 text-destructive" /> Cancel booking
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this booking?"
        description="Your tickets will be voided and the seats released. Refunds are processed by the admin per policy."
        confirmLabel="Cancel booking"
        destructive
        pending={isCancelling}
        onConfirm={handleCancel}
      />
    </div>
  );
}
