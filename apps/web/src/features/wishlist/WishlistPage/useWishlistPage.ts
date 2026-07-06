import { toast } from "sonner";
import { useGetWishlist, useToggleWishlist } from "@/api";

export function useWishlistPage() {
  const wishlistQuery = useGetWishlist();
  const toggleWishlist = useToggleWishlist({
    onSuccess: () => toast.success("Removed from wishlist"),
  });

  return {
    events: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isPending,
    isError: wishlistQuery.isError,
    error: wishlistQuery.error,
    refetch: wishlistQuery.refetch,
    isRemoving: toggleWishlist.isPending,
    handleRemove: (eventId: number) => toggleWishlist.mutate({ eventId, inWishlist: true }),
  };
}
