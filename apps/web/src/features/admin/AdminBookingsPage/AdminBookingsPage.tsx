import type { BookingDto, BookingStatus } from "@eventsphere/shared";
import {
  Badge,
  DataTable,
  Input,
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
import { useAdminBookingsPage } from "./useAdminBookingsPage";

const statusVariant: Record<BookingStatus, "success" | "secondary" | "destructive" | "outline"> = {
  confirmed: "success",
  pending: "outline",
  cancelled: "destructive",
  expired: "secondary",
  refunded: "secondary",
};

export function AdminBookingsPage() {
  const {
    bookings,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    status,
    search,
    allFilter,
    setPage,
    handleStatusChange,
    handleSearchChange,
  } = useAdminBookingsPage();

  const columns: Column<BookingDto>[] = [
    {
      key: "booking",
      header: "Booking",
      render: (b) => (
        <div>
          <p className="font-mono text-xs font-medium">{b.bookingNumber}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(b.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "event",
      header: "Event",
      className: "max-w-52",
      render: (b) => <span className="line-clamp-1">{b.event.title}</span>,
    },
    {
      key: "attendee",
      header: "Attendee",
      className: "hidden md:table-cell",
      render: (b) => (
        <div>
          <p>{b.attendee?.name}</p>
          <p className="text-xs text-muted-foreground">{b.attendee?.email}</p>
        </div>
      ),
    },
    { key: "amount", header: "Amount", render: (b) => formatINR(b.totalAmountPaise) },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <Badge variant={statusVariant[b.status]} className="capitalize">
          {b.status}
        </Badge>
      ),
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="Bookings" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Bookings" description="Every booking across all events" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search booking number…"
          className="max-w-xs"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allFilter}>All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={bookings}
        rowKey={(b) => b.id}
        isLoading={isLoading}
        emptyMessage="No bookings match these filters"
        meta={meta}
        onPageChange={setPage}
      />
    </div>
  );
}
