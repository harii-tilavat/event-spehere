import { useParams } from "react-router-dom";
import { useGetEvent } from "@/api";
import { useAuth } from "@/context/AuthContext";

export function useEventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const eventQuery = useGetEvent(slug);

  const event = eventQuery.data;
  const isBookable =
    !!event &&
    event.status === "published" &&
    new Date(event.registrationDeadline) > new Date() &&
    event.ticketTypes.some((t) => t.isOnSale);

  return {
    event,
    isLoading: eventQuery.isPending,
    isError: eventQuery.isError,
    error: eventQuery.error,
    refetch: eventQuery.refetch,
    isBookable,
    viewerRole: user?.role ?? null,
    isVerifiedAttendee: user?.role === "attendee" && user.isEmailVerified,
  };
}
