import { useState } from "react";
import { toast } from "sonner";
import type { EventStatus, OrganizerEventDto } from "@eventsphere/shared";
import { useApproveEvent, useGetAdminEvents, useRejectEvent, useToggleFeatureEvent } from "@/api";

const ALL_FILTER = "all";

export function useAdminEventsPage(mode: "approvals" | "all") {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>(mode === "approvals" ? "pending_approval" : ALL_FILTER);
  const [rejecting, setRejecting] = useState<OrganizerEventDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const effectiveStatus = mode === "approvals" ? "pending_approval" : status;
  const eventsQuery = useGetAdminEvents({
    page,
    status: effectiveStatus === ALL_FILTER ? undefined : (effectiveStatus as EventStatus),
  });

  const approveEvent = useApproveEvent({
    onSuccess: () => toast.success("Event approved and published"),
  });
  const rejectEvent = useRejectEvent({
    onSuccess: () => toast.success("Event rejected — organizer notified"),
    onSettled: () => {
      setRejecting(null);
      setRejectReason("");
    },
  });
  const toggleFeature = useToggleFeatureEvent({
    onSuccess: (event) => toast.success(event.isFeatured ? "Event featured" : "Event unfeatured"),
  });

  const handleConfirmReject = () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      toast.error("A reason is required when rejecting");
      return;
    }
    rejectEvent.mutate({ id: rejecting.id, reason: rejectReason.trim() });
  };

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
    rejecting,
    setRejecting,
    rejectReason,
    setRejectReason,
    isApproving: approveEvent.isPending,
    isRejecting: rejectEvent.isPending,
    handleStatusChange: (value: string) => {
      setStatus(value);
      setPage(1);
    },
    handleApprove: (id: number) => approveEvent.mutate(id),
    handleToggleFeature: (id: number) => toggleFeature.mutate(id),
    handleConfirmReject,
  };
}
