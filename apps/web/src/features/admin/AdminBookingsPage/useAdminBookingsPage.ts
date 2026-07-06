import { useState } from "react";
import type { BookingStatus } from "@eventsphere/shared";
import { useGetAdminBookings } from "@/api";
import { useDebounce } from "@/hooks/useDebounce";

const ALL_FILTER = "all";

export function useAdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>(ALL_FILTER);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const bookingsQuery = useGetAdminBookings({
    page,
    status: status === ALL_FILTER ? undefined : (status as BookingStatus),
    search: debouncedSearch || undefined,
  });

  return {
    bookings: bookingsQuery.data?.rows ?? [],
    meta: bookingsQuery.data?.meta,
    isLoading: bookingsQuery.isPending,
    isError: bookingsQuery.isError,
    error: bookingsQuery.error,
    refetch: bookingsQuery.refetch,
    status,
    search,
    allFilter: ALL_FILTER,
    setPage,
    handleStatusChange: (value: string) => {
      setStatus(value);
      setPage(1);
    },
    handleSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
  };
}
