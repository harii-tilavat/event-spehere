import { useMemo, useState } from "react";
import { getErrorMessage } from "@/api/core";
import {
  useCheckIn,
  useGetAttendance,
  useGetOrganizerEvents,
  useManualCheckIn,
  useManualLookup,
  type ManualCheckInLookupDto,
} from "@/api";
import type { LastCheckInFeedback } from "./types";

export function useCheckInPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [manualPayload, setManualPayload] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [lookup, setLookup] = useState<ManualCheckInLookupDto | null>(null);
  const [feedback, setFeedback] = useState<LastCheckInFeedback | null>(null);

  const eventsQuery = useGetOrganizerEvents({ page: 1 });
  const checkableEvents = useMemo(
    () => (eventsQuery.data?.rows ?? []).filter((e) => e.status === "published" || e.status === "completed"),
    [eventsQuery.data],
  );
  const eventId = selectedEventId ? Number(selectedEventId) : undefined;
  const attendanceQuery = useGetAttendance(eventId);

  const applyResult = (message: string, result?: LastCheckInFeedback["result"]) =>
    setFeedback({ kind: "success", message, result });
  const applyError = (err: unknown) => setFeedback({ kind: "error", message: getErrorMessage(err) });

  const checkIn = useCheckIn({
    onSuccess: (result) => applyResult(`Checked in ${result.attendeeName} (${result.ticket.ticketTypeName})`, result),
    onError: applyError,
  });
  const manualCheckIn = useManualCheckIn({
    onSuccess: (result) => {
      applyResult(`Checked in ${result.attendeeName} (${result.ticket.ticketTypeName})`, result);
      // refresh the open lookup so ticket statuses update in place
      if (lookup) manualLookup.mutate(lookup.bookingNumber);
    },
    onError: applyError,
  });
  const manualLookup = useManualLookup({
    onSuccess: (result) => setLookup(result),
    onError: applyError,
  });

  return {
    checkableEvents,
    isLoadingEvents: eventsQuery.isPending,
    selectedEventId,
    setSelectedEventId,
    attendance: attendanceQuery.data,
    feedback,
    manualPayload,
    setManualPayload,
    bookingNumber,
    setBookingNumber,
    lookup,
    isCheckingIn: checkIn.isPending || manualCheckIn.isPending,
    isLookingUp: manualLookup.isPending,
    handleScan: (payload: string) => checkIn.mutate(payload),
    handleManualPayload: () => {
      const value = manualPayload.trim();
      if (!value) return;
      // full signed payload contains a dot; a bare code goes through the trusted manual path
      if (value.includes(".")) checkIn.mutate(value);
      else manualCheckIn.mutate(value);
      setManualPayload("");
    },
    handleLookup: () => bookingNumber.trim() && manualLookup.mutate(bookingNumber.trim()),
    handleCheckInTicket: (ticketCode: string) => manualCheckIn.mutate(ticketCode),
  };
}
