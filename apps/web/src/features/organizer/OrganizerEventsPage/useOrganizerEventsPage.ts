import { useState } from "react";
import { toast } from "sonner";
import type { EventStatus, OrganizerEventDto } from "@eventsphere/shared";
import { useCancelEvent, useDeleteEvent, useGetOrganizerEvents, useSubmitEvent } from "@/api";

const ALL_FILTER = "all";

export function useOrganizerEventsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>(ALL_FILTER);
  const [deleting, setDeleting] = useState<OrganizerEventDto | null>(null);
  const [cancelling, setCancelling] = useState<OrganizerEventDto | null>(null);

  const eventsQuery = useGetOrganizerEvents({
    page,
    status: status === ALL_FILTER ? undefined : (status as EventStatus),
  });

  const submitEvent = useSubmitEvent({
    onSuccess: () => toast.success("Event submitted for approval"),
  });
  const cancelEvent = useCancelEvent({
    onSuccess: () => {
      toast.success("Event cancelled — attendees will be notified");
      setCancelling(null);
    },
  });
  const deleteEvent = useDeleteEvent({
    onSuccess: () => {
      toast.success("Event deleted");
      setDeleting(null);
    },
  });

  return {
    events: eventsQuery.data?.rows ?? [],
    meta: eventsQuery.data?.meta,
    isLoading: eventsQuery.isPending,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    status,
    allFilter: ALL_FILTER,
    setPage,
    deleting,
    setDeleting,
    cancelling,
    setCancelling,
    isSubmitting: submitEvent.isPending,
    isCancelling: cancelEvent.isPending,
    isDeleting: deleteEvent.isPending,
    handleStatusChange: (value: string) => {
      setStatus(value);
      setPage(1);
    },
    handleSubmit: (id: number) => submitEvent.mutate(id),
    handleCancel: () => cancelling && cancelEvent.mutate(cancelling.id),
    handleDelete: () => deleting && deleteEvent.mutate(deleting.id),
  };
}
