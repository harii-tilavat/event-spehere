import { Undo2 } from "lucide-react";
import type { PaymentListItemDto, PaymentStatus } from "@eventsphere/shared";
import {
  Badge,
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
import { formatDateTime, formatINR } from "@/lib/format";
import { useAdminPaymentsPage } from "./useAdminPaymentsPage";

const statusVariant: Record<PaymentStatus, "success" | "secondary" | "destructive" | "outline"> = {
  captured: "success",
  created: "outline",
  failed: "destructive",
  refunded: "secondary",
};

export function AdminPaymentsPage() {
  const {
    payments,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    status,
    allFilter,
    setPage,
    refunding,
    setRefunding,
    isRefunding,
    handleStatusChange,
    handleRefund,
  } = useAdminPaymentsPage();

  const columns: Column<PaymentListItemDto>[] = [
    {
      key: "order",
      header: "Order",
      render: (p) => (
        <div>
          <p className="font-mono text-xs font-medium">{p.orderId}</p>
          <p className="text-xs text-muted-foreground">
            {p.bookingNumber} · {formatDateTime(p.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "event",
      header: "Event",
      className: "hidden max-w-48 md:table-cell",
      render: (p) => <span className="line-clamp-1">{p.eventTitle}</span>,
    },
    {
      key: "attendee",
      header: "Attendee",
      className: "hidden lg:table-cell",
      render: (p) => <span className="text-muted-foreground">{p.attendeeEmail}</span>,
    },
    { key: "amount", header: "Amount", render: (p) => formatINR(p.amountPaise) },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <div>
          <Badge variant={statusVariant[p.status]} className="capitalize">
            {p.status}
          </Badge>
          {p.errorReason && <p className="mt-1 max-w-40 truncate text-xs text-destructive">{p.errorReason}</p>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      render: (p) =>
        p.status === "captured" ? (
          <Button variant="ghost" size="sm" onClick={() => setRefunding(p)}>
            <Undo2 className="size-4" /> Refund
          </Button>
        ) : null,
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="Payments" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Payments" description="Transaction log across the platform" />

      <div className="mb-4">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allFilter}>All statuses</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={payments}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No payments match this filter"
        meta={meta}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!refunding}
        onOpenChange={(open) => !open && setRefunding(null)}
        title={`Refund ${refunding ? formatINR(refunding.amountPaise) : ""}?`}
        description="The booking will be marked refunded, its tickets voided, and inventory released."
        confirmLabel="Refund payment"
        destructive
        pending={isRefunding}
        onConfirm={handleRefund}
      />
    </div>
  );
}
