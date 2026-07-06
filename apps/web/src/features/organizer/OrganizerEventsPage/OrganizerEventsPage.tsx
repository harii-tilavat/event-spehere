import { Link } from "react-router-dom";
import { Ban, ExternalLink, Pencil, Plus, Send, Trash2 } from "lucide-react";
import type { OrganizerEventDto } from "@eventsphere/shared";
import {
  Button,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Column,
} from "@eventsphere/ui";
import { QueryError } from "@/components";
import { EventStatusBadge } from "@/components/EventStatusBadge/EventStatusBadge";
import { formatDateTime } from "@/lib/format";
import { useOrganizerEventsPage } from "./useOrganizerEventsPage";

const EDITABLE = new Set(["draft", "rejected"]);

export function OrganizerEventsPage() {
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
    deleting,
    setDeleting,
    cancelling,
    setCancelling,
    isSubmitting,
    isCancelling,
    isDeleting,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    handleDelete,
  } = useOrganizerEventsPage();

  const columns: Column<OrganizerEventDto>[] = [
    {
      key: "title",
      header: "Event",
      render: (e) => (
        <div>
          <p className="font-medium">{e.title}</p>
          <p className="text-xs text-muted-foreground">
            {e.venueName}, {e.city}
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
      render: (e) => (
        <span className="text-muted-foreground">
          {e.ticketsSold} · {e.ticketTypesCount} type{e.ticketTypesCount === 1 ? "" : "s"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-44 text-right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          {(e.status === "published" || e.status === "completed" || e.status === "cancelled") && (
            <Button variant="ghost" size="icon" title="View public page" asChild>
              <Link to={`/events/${e.slug}`}>
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          )}
          {EDITABLE.has(e.status) && (
            <>
              <Button variant="ghost" size="icon" title="Edit" asChild>
                <Link to={`/organizer/events/${e.slug}/edit`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Submit for approval"
                disabled={isSubmitting}
                onClick={() => handleSubmit(e.id)}
              >
                <Send className="size-4 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleting(e)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </>
          )}
          {e.status === "published" && (
            <Button variant="ghost" size="icon" title="Cancel event" onClick={() => setCancelling(e)}>
              <Ban className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="My events" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My events"
        description="Create, submit, and manage your events"
        actions={
          <Button asChild>
            <Link to="/organizer/events/new">
              <Plus className="size-4" /> Create event
            </Link>
          </Button>
        }
      />

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

      <DataTable
        columns={columns}
        rows={events}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyMessage="No events yet — create your first one"
        meta={meta}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.title}"?`}
        description="Only drafts and rejected events can be deleted. This cannot be undone."
        confirmLabel="Delete event"
        destructive
        pending={isDeleting}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(open) => !open && setCancelling(null)}
        title={`Cancel "${cancelling?.title}"?`}
        description="All attendees with confirmed bookings will be notified by email. This cannot be undone."
        confirmLabel="Cancel event"
        destructive
        pending={isCancelling}
        onConfirm={handleCancel}
      />
    </div>
  );
}
