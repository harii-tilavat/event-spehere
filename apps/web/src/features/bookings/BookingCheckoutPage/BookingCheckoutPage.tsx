import { Link } from "react-router-dom";
import { CheckCircle2, Clock, CreditCard, Minus, Plus, TicketX } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageHeader } from "@eventsphere/ui";
import { QueryError } from "@/components";
import { formatCountdown } from "@/hooks/useCountdown";
import { formatINR } from "@/lib/format";
import { useBookingCheckoutPage } from "./useBookingCheckoutPage";

export function BookingCheckoutPage() {
  const {
    event,
    isLoadingEvent,
    isEventError,
    eventError,
    refetchEvent,
    step,
    onSaleTickets,
    quantities,
    totalPaise,
    totalQuantity,
    active,
    confirmedBooking,
    secondsLeft,
    isHoldExpired,
    isCreating,
    isPaying,
    adjustQuantity,
    handleProceed,
    handleMockPay,
    handleRazorpayPay,
    handleStartOver,
    goToBooking,
  } = useBookingCheckoutPage();

  if (isLoadingEvent) return <div className="mx-auto max-w-2xl px-4 py-8"><div className="h-96 animate-pulse rounded-2xl border bg-card" /></div>;
  if (isEventError || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <QueryError error={eventError} onRetry={refetchEvent} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <PageHeader title={`Book: ${event.title}`} description={`${event.venueName}, ${event.city}`} />

      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {onSaleTickets.length === 0 && (
              <p className="text-sm text-muted-foreground">No tickets are currently on sale for this event.</p>
            )}
            {onSaleTickets.map((t) => {
              const qty = quantities[t.id] ?? 0;
              const max = Math.min(t.maxPerBooking, t.remaining);
              return (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.pricePaise === 0 ? "Free" : formatINR(t.pricePaise)} · {t.remaining} left · max {t.maxPerBooking}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled={qty === 0} onClick={() => adjustQuantity(t.id, -1, max)} aria-label={`Fewer ${t.name}`}>
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                    <Button variant="outline" size="icon" disabled={qty >= max} onClick={() => adjustQuantity(t.id, 1, max)} aria-label={`More ${t.name}`}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {totalQuantity} ticket{totalQuantity === 1 ? "" : "s"}
              </p>
              <p className="text-lg font-semibold">{formatINR(totalPaise)}</p>
            </div>
            <Button className="w-full" disabled={totalQuantity === 0 || isCreating} onClick={handleProceed}>
              {isCreating ? "Reserving…" : "Proceed to payment"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Tickets are held for 15 minutes while you complete payment.
            </p>
          </CardContent>
        </Card>
      )}

      {step === "pay" && active && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Payment</CardTitle>
            <Badge variant={isHoldExpired ? "destructive" : "secondary"}>
              <Clock className="size-3" /> {isHoldExpired ? "Hold expired" : formatCountdown(secondsLeft)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 rounded-lg border p-3 text-sm">
              <p className="font-medium">{active.booking.bookingNumber}</p>
              {active.booking.items.map((i) => (
                <p key={i.id} className="flex justify-between text-muted-foreground">
                  <span>
                    {i.quantity} × {i.ticketTypeName}
                  </span>
                  <span>{formatINR(i.subtotalPaise)}</span>
                </p>
              ))}
              <p className="flex justify-between border-t pt-1 font-semibold">
                <span>Total</span>
                <span>{formatINR(active.booking.totalAmountPaise)}</span>
              </p>
            </div>

            {isHoldExpired ? (
              <div className="space-y-3 text-center">
                <TicketX className="mx-auto size-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Your ticket hold expired and the seats were released. You can start over.
                </p>
                <Button className="w-full" variant="outline" onClick={handleStartOver}>
                  Start over
                </Button>
              </div>
            ) : active.checkout.provider === "mock" ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Test payment gateway (Razorpay sandbox unavailable) — the signature verification below is identical to
                  the real flow.
                </p>
                <Button className="w-full" disabled={isPaying} onClick={() => handleMockPay("success")}>
                  <CreditCard className="size-4" /> {isPaying ? "Processing…" : `Pay ${formatINR(active.booking.totalAmountPaise)}`}
                </Button>
                <Button className="w-full" variant="outline" disabled={isPaying} onClick={() => handleMockPay("failure")}>
                  Simulate failed payment
                </Button>
              </div>
            ) : (
              <Button className="w-full" disabled={isPaying} onClick={handleRazorpayPay}>
                <CreditCard className="size-4" /> {isPaying ? "Processing…" : "Pay with Razorpay"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {step === "done" && confirmedBooking && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 className="size-10 text-success" />
            <div>
              <p className="text-lg font-semibold">Booking confirmed!</p>
              <p className="text-sm text-muted-foreground">
                {confirmedBooking.bookingNumber} · {confirmedBooking.tickets.length} ticket
                {confirmedBooking.tickets.length === 1 ? "" : "s"} · confirmation email sent
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={goToBooking}>View tickets</Button>
              <Button variant="outline" asChild>
                <Link to="/events">Browse more events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
