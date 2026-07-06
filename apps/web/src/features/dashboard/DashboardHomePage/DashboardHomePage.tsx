import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarDays, IndianRupee, Ticket, UserCheck, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@eventsphere/ui";
import type { DashboardRange } from "@/api";
import { formatDateTime, formatINR } from "@/lib/format";
import { CategoryChart, RevenueChart, StatCard } from "./components";
import { useDashboardHomePage } from "./useDashboardHomePage";

const RANGE_LABELS: Record<DashboardRange, string> = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", all: "All time" };

export function DashboardHomePage() {
  const {
    user,
    range,
    setRange,
    quickLinks,
    isPendingOrganizer,
    organizerStatus,
    rejectionReason,
    admin,
    organizer,
    attendee,
    isLoadingStats,
  } = useDashboardHomePage();
  if (!user) return null;

  const showRangePicker = user.role !== "attendee" && !isPendingOrganizer;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Here's your EventSphere workspace"
        actions={
          showRangePicker ? (
            <Select value={range} onValueChange={(v) => setRange(v as DashboardRange)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RANGE_LABELS) as DashboardRange[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RANGE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : undefined
        }
      />

      {isPendingOrganizer && (
        <Card className="border-yellow-500/30">
          <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm">
            <Badge variant="outline" className="border-yellow-500/50 capitalize text-yellow-500">
              {organizerStatus ?? "pending"}
            </Badge>
            {organizerStatus === "rejected" ? (
              <span>Your organizer application was rejected{rejectionReason ? `: ${rejectionReason}` : ""}.</span>
            ) : (
              <span>Your organizer application is awaiting admin approval — event creation unlocks once approved.</span>
            )}
          </CardContent>
        </Card>
      )}

      {isLoadingStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border bg-card" />
          ))}
        </div>
      )}

      {admin && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatINR(admin.totals.revenuePaise)} icon={IndianRupee} />
            <StatCard label="Confirmed bookings" value={String(admin.totals.confirmedBookings)} icon={Ticket} />
            <StatCard
              label="Published events"
              value={String(admin.totals.publishedEvents)}
              icon={CalendarDays}
              hint={admin.totals.pendingApprovals > 0 ? `${admin.totals.pendingApprovals} awaiting approval` : undefined}
            />
            <StatCard label="Users" value={String(admin.totals.users)} icon={Users} hint={`${admin.totals.organizers} organizers`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueChart series={admin.revenueSeries} />
            <CategoryChart data={admin.bookingsByCategory} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {admin.recentBookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
              {admin.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {b.bookingNumber} · {b.event.title} · {b.attendee?.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {formatINR(b.totalAmountPaise)}
                    <Badge variant={b.status === "confirmed" ? "success" : "secondary"} className="capitalize">
                      {b.status}
                    </Badge>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {organizer && !isPendingOrganizer && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatINR(organizer.totals.revenuePaise)} icon={IndianRupee} />
            <StatCard label="Tickets sold" value={String(organizer.totals.ticketsSold)} icon={Ticket} />
            <StatCard
              label="Events"
              value={String(organizer.totals.events)}
              icon={CalendarDays}
              hint={`${organizer.totals.published} published`}
            />
            <StatCard label="Attendance rate" value={`${organizer.totals.attendanceRate}%`} icon={UserCheck} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueChart series={organizer.revenueSeries} />
            <Card>
              <CardHeader>
                <CardTitle>Upcoming events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {organizer.upcomingEvents.length === 0 && (
                  <p className="text-muted-foreground">No upcoming published events.</p>
                )}
                {organizer.upcomingEvents.map((e) => (
                  <Link key={e.id} to={`/events/${e.slug}`} className="flex items-center justify-between gap-2 hover:underline">
                    <span className="min-w-0 truncate">{e.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(e.startTime)}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {attendee && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Confirmed bookings" value={String(attendee.totals.confirmed)} icon={Ticket} />
            <StatCard label="Events attended" value={String(attendee.totals.attended)} icon={BadgeCheck} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {attendee.upcomingBookings.length === 0 && (
                <p className="text-muted-foreground">
                  Nothing booked yet —{" "}
                  <Link to="/events" className="underline underline-offset-4">
                    browse events
                  </Link>
                  .
                </p>
              )}
              {attendee.upcomingBookings.map((b) => (
                <Link key={b.id} to={`/account/bookings/${b.id}`} className="flex items-center justify-between gap-2 hover:underline">
                  <span className="min-w-0 truncate">{b.event.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(b.event.startTime)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-colors group-hover:border-ring">
              <CardContent className="flex items-center justify-between p-5">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Icon className="size-5 text-primary" /> {label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
