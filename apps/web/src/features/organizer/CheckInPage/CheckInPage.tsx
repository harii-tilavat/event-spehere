import { CheckCircle2, ScanLine, Search, UserCheck, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@eventsphere/ui";
import { QrScanner } from "@/components/QrScanner/QrScanner";
import { formatDateTime } from "@/lib/format";
import { useCheckInPage } from "./useCheckInPage";

export function CheckInPage() {
  const {
    checkableEvents,
    isLoadingEvents,
    selectedEventId,
    setSelectedEventId,
    attendance,
    feedback,
    manualPayload,
    setManualPayload,
    bookingNumber,
    setBookingNumber,
    lookup,
    isCheckingIn,
    isLookingUp,
    handleScan,
    handleManualPayload,
    handleLookup,
    handleCheckInTicket,
  } = useCheckInPage();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Check-in" description="Scan QR tickets or check in attendees manually" />

      <div className="mb-4 max-w-sm">
        <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={isLoadingEvents}>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingEvents ? "Loading events…" : "Select an event for stats"} />
          </SelectTrigger>
          <SelectContent>
            {checkableEvents.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {attendance && (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-center gap-6 p-4">
            <div>
              <p className="text-2xl font-bold">
                {attendance.checkedIn}
                <span className="text-base font-normal text-muted-foreground"> / {attendance.totalTickets}</span>
              </p>
              <p className="text-xs text-muted-foreground">checked in · {attendance.rate}%</p>
            </div>
            <div className="min-w-0 flex-1">
              {attendance.recent.slice(0, 3).map((r) => (
                <p key={r.ticketCode} className="truncate text-xs text-muted-foreground">
                  <UserCheck className="mr-1 inline size-3 text-success" />
                  {r.attendeeName} · {r.ticketTypeName} · {formatDateTime(r.checkedInAt)}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Card className={`mb-4 ${feedback.kind === "success" ? "border-success/40" : "border-destructive/40"}`}>
          <CardContent className="flex items-center gap-2 p-4 text-sm">
            {feedback.kind === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-success" />
            ) : (
              <XCircle className="size-5 shrink-0 text-destructive" />
            )}
            {feedback.message}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="size-4" /> QR scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QrScanner onScan={handleScan} paused={isCheckingIn} />
            <div className="flex gap-2">
              <Input
                placeholder="Paste QR payload or ticket code"
                value={manualPayload}
                onChange={(e) => setManualPayload(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualPayload()}
              />
              <Button disabled={isCheckingIn || !manualPayload.trim()} onClick={handleManualPayload}>
                Check in
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-4" /> Find by booking number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="EVS-XXXXXXXX"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
              <Button variant="outline" disabled={isLookingUp || !bookingNumber.trim()} onClick={handleLookup}>
                {isLookingUp ? "Searching…" : "Find"}
              </Button>
            </div>

            {lookup && (
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-sm font-medium">
                  {lookup.attendeeName} · {lookup.eventTitle}
                </p>
                {lookup.tickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-mono text-xs">{t.ticketCode}</span>
                    {t.status === "valid" ? (
                      <Button size="sm" disabled={isCheckingIn} onClick={() => handleCheckInTicket(t.ticketCode)}>
                        Check in
                      </Button>
                    ) : (
                      <Badge variant={t.status === "checked_in" ? "success" : "destructive"} className="capitalize">
                        {t.status.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
