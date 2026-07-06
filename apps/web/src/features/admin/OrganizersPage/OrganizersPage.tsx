import { BadgeCheck, BadgeX, Globe } from "lucide-react";
import type { OrganizerApplicationDto } from "@eventsphere/shared";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
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
import { formatDate } from "@/lib/format";
import { useOrganizersPage } from "./useOrganizersPage";

const statusBadge = {
  pending: <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">Pending</Badge>,
  approved: <Badge variant="success">Approved</Badge>,
  rejected: <Badge variant="destructive">Rejected</Badge>,
} as const;

export function OrganizersPage() {
  const {
    organizers,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    search,
    approvalStatus,
    decision,
    rejectReason,
    setRejectReason,
    setDecision,
    setPage,
    isDeciding,
    allFilter,
    handleSearchChange,
    handleStatusChange,
    handleConfirmDecision,
  } = useOrganizersPage();

  const columns: Column<OrganizerApplicationDto>[] = [
    {
      key: "organization",
      header: "Organization",
      render: (o) => (
        <div>
          <p className="font-medium">{o.organizationName}</p>
          <p className="text-xs text-muted-foreground">
            {o.user.name} · {o.user.email}
          </p>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      className: "hidden md:table-cell",
      render: (o) =>
        o.website ? (
          <a
            href={o.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
          >
            <Globe className="size-3" /> {o.website.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "status", header: "Status", render: (o) => statusBadge[o.approvalStatus] },
    {
      key: "applied",
      header: "Applied",
      className: "hidden lg:table-cell",
      render: (o) => <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-32 text-right",
      render: (o) =>
        o.approvalStatus === "approved" ? null : (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Approve"
              onClick={() => setDecision({ organizer: o, action: "approve" })}
            >
              <BadgeCheck className="size-4 text-success" />
            </Button>
            {o.approvalStatus !== "rejected" && (
              <Button
                variant="ghost"
                size="icon"
                title="Reject"
                onClick={() => setDecision({ organizer: o, action: "reject" })}
              >
                <BadgeX className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        ),
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="Organizers" description="Review organizer applications" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Organizers" description="Review organizer applications and manage approved organizers" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search organization…"
          className="max-w-xs"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Select value={approvalStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value={allFilter}>All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={organizers}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        emptyMessage="No organizer applications match these filters"
        meta={meta}
        onPageChange={setPage}
      />

      <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decision?.action === "approve" ? "Approve" : "Reject"} {decision?.organizer.organizationName}?
            </DialogTitle>
            <DialogDescription>
              {decision?.action === "approve"
                ? "The organizer will be able to create and submit events immediately."
                : "The applicant will be notified with your reason."}
            </DialogDescription>
          </DialogHeader>
          {decision?.action === "reject" && (
            <Textarea
              placeholder="Reason for rejection…"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)} disabled={isDeciding}>
              Cancel
            </Button>
            <Button
              variant={decision?.action === "reject" ? "destructive" : "default"}
              onClick={handleConfirmDecision}
              disabled={isDeciding}
            >
              {isDeciding ? "Working…" : decision?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
