import { useState } from "react";
import { useGetMyBookings } from "@/api";

export function useMyBookingsPage() {
  const [page, setPage] = useState(1);
  const bookingsQuery = useGetMyBookings({ page });

  return {
    bookings: bookingsQuery.data?.rows ?? [],
    meta: bookingsQuery.data?.meta,
    isLoading: bookingsQuery.isPending,
    isError: bookingsQuery.isError,
    error: bookingsQuery.error,
    refetch: bookingsQuery.refetch,
    setPage,
  };
}
