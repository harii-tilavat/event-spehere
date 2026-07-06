import { useState } from "react";
import { toast } from "sonner";
import { useDecideOrganizer, useGetOrganizers } from "@/api";
import { useDebounce } from "@/hooks/useDebounce";
import type { DecisionDialogState } from "./types";

const ALL_FILTER = "all";

export function useOrganizersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<string>("pending");
  const debouncedSearch = useDebounce(search);
  const [decision, setDecision] = useState<DecisionDialogState | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const organizersQuery = useGetOrganizers({
    page,
    search: debouncedSearch || undefined,
    approvalStatus: approvalStatus === ALL_FILTER ? undefined : approvalStatus,
  });

  const decideOrganizer = useDecideOrganizer({
    onSuccess: (profile) =>
      toast.success(profile.approvalStatus === "approved" ? "Organizer approved" : "Organizer rejected"),
    onSettled: () => {
      setDecision(null);
      setRejectReason("");
    },
  });

  const handleConfirmDecision = () => {
    if (!decision) return;
    if (decision.action === "reject" && !rejectReason.trim()) {
      toast.error("A reason is required when rejecting");
      return;
    }
    decideOrganizer.mutate({
      id: decision.organizer.id,
      action: decision.action,
      reason: decision.action === "reject" ? rejectReason.trim() : undefined,
    });
  };

  return {
    organizers: organizersQuery.data?.rows ?? [],
    meta: organizersQuery.data?.meta,
    isLoading: organizersQuery.isPending,
    isError: organizersQuery.isError,
    error: organizersQuery.error,
    refetch: organizersQuery.refetch,
    search,
    approvalStatus,
    decision,
    rejectReason,
    setRejectReason,
    setDecision,
    setPage,
    isDeciding: decideOrganizer.isPending,
    allFilter: ALL_FILTER,
    handleSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    handleStatusChange: (value: string) => {
      setApprovalStatus(value);
      setPage(1);
    },
    handleConfirmDecision,
  };
}
