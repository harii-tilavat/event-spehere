import { Link } from "react-router-dom";
import { BadgeCheck, BadgeX, ExternalLink, Star } from "lucide-react";
import type { OrganizerEventDto } from "@eventsphere/shared";
import {
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  type Column,
} from "@eventsphere/ui";
import { QueryError } from "@/components";
import { EventStatusBadge } from "@/components/EventStatusBadge/EventStatusBadge";
import { formatDateTime } from "@/lib/format";
import { useAdminEventsPage } from "./useAdminEventsPage";
import type { AdminEventsPageProps } from "./types";

export function AdminEventsPage({ mode }: AdminEventsPageProps) {
  const {
    events,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    status,
    allFilter,
    setPage,
    rejecting,
    setRejecting,
    rejectReason,
    setRejectReason,
    isApproving,
    isRejecting,
    handleStatusChange,
    handleApprove,
    handleToggleFeature,
    handleConfirmReject,
  } = useAdminEventsPage(mode);

  const columns: Column<OrganizerEventDto>[] = [
    {
      key: "title",
      header: "Event",
      render: (e) => (
        <div>
          <p className="font-medium">{e.title}</p>
          <p className="text-xs text-muted-foreground">
            {e.venueName}, {e.city} · {e.categoryName}
          </p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (e) => <EventStatusBadge status={e.status} /> },
    {
      key: "start",
      header: "Starts",
      className: "hidden md:table-cell",
      render: (e) => <span className="text-muted-foreground">{formatDateTime(e.startTime)}</span>,
    },
    {
      key: "sold",
      header: "Sold",
      className: "hidden lg:table-cell",
      render: (e) => <span className="text-muted-foreground">{e.ticketsSold}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-40 text-right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title="Review event page" asChild>
            <Link to={`/events/${e.slug}`}>
              <ExternalLink className="size-4" />
            </Link>
          </Button>
          {e.status === "pending_approval" && (
            <>
              <Button variant="ghost" size="icon" title="Approve" disabled={isApproving} onClick={() => handleApprove(e.id)}>
                <BadgeCheck className="size-4 text-success" />
              </Button>
              <Button variant="ghost" size="icon" title="Reject" onClick={() => setRejecting(e)}>
                <BadgeX className="size-4 text-destructive" />
              </Button>
            </>
          )}
          {e.status === "published" && (
            <Button
              variant="ghost"
              size="icon"
              title={e.isFeatured ? "Unfeature" : "Feature"}
              onClick={() => handleToggleFeature(e.id)}
            >
              <Star className={e.isFeatured ? "size-4 fill-yellow-500 text-yellow-500" : "size-4"} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const title = mode === "approvals" ? "Event approvals" : "All events";
  const description =
    mode === "approvals" ? "Events waiting for review — approving publishes them" : "Every event across all organizers";

  if (isError) {
    return (
      <div>
        <PageHeader title={title} description={description} />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={title} description={description} />

      {mode === "all" && (
        <div className="mb-4">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allFilter}>All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending approval</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={events}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyMessage={mode === "approvals" ? "No events waiting for approval" : "No events match this filter"}
        meta={meta}
        onPageChange={setPage}
      />

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject "{rejecting?.title}"?</DialogTitle>
            <DialogDescription>The organizer will be emailed your reason and can edit and resubmit.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection…"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={isRejecting}>
              {isRejecting ? "Working…" : "Reject event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
