import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useGetEvent, useGetWishlistIds, useToggleWishlist } from "@/api";
import { useAuth } from "@/context/AuthContext";

export function useEventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const eventQuery = useGetEvent(slug);
  const event = eventQuery.data;

  const isAttendee = user?.role === "attendee";
  const wishlistIdsQuery = useGetWishlistIds(isAttendee);
  const inWishlist = !!event && (wishlistIdsQuery.data ?? []).includes(event.id);

  const toggleWishlist = useToggleWishlist({
    onSuccess: (_data, variables) =>
      toast.success(variables.inWishlist ? "Removed from wishlist" : "Added to wishlist"),
  });

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
    isAttendee,
    inWishlist,
    isTogglingWishlist: toggleWishlist.isPending,
    handleToggleWishlist: () => event && toggleWishlist.mutate({ eventId: event.id, inWishlist }),
  };
}
