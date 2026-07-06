import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { downloadTicketPdf, useCancelBooking, useGetBooking } from "@/api";
import { getErrorMessage } from "@/api/core";

export function useBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = id ? Number(id) : undefined;
  const [cancelOpen, setCancelOpen] = useState(false);

  const bookingQuery = useGetBooking(bookingId, { pollWhilePending: true });
  const booking = bookingQuery.data;

  const cancelBooking = useCancelBooking({
    onSuccess: () => {
      toast.success("Booking cancelled");
      setCancelOpen(false);
    },
  });

  const isUpcoming = !!booking && new Date(booking.event.startTime) > new Date();

  return {
    booking,
    isLoading: bookingQuery.isPending,
    isError: bookingQuery.isError,
    error: bookingQuery.error,
    refetch: bookingQuery.refetch,
    canCancel: booking?.status === "confirmed" && isUpcoming,
    cancelOpen,
    setCancelOpen,
    isCancelling: cancelBooking.isPending,
    handleCancel: () => bookingId && cancelBooking.mutate(bookingId),
    handleDownloadTicket: (code: string) => {
      downloadTicketPdf(code).catch((err) => toast.error(getErrorMessage(err)));
    },
  };
}
