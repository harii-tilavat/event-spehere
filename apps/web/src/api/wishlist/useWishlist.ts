import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCall, getCall, postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { wishlistPaths } from "./paths";
import { mutationEndpoints, queryEndpoints } from "./endpoints";
import type { ToggleWishlistVariables, WishlistIdsResponse, WishlistResponse } from "./types";

export const useGetWishlist = (enabled = true) => {
  const { queryKey, url } = queryEndpoints.getWishlist();
  return useQuery({
    queryKey,
    queryFn: () => getCall<WishlistResponse>(url),
    select: (res) => res.data.data.events,
    enabled,
  });
};

export const useGetWishlistIds = (enabled = true) => {
  const { queryKey, url } = queryEndpoints.getWishlistIds();
  return useQuery({
    queryKey,
    queryFn: () => getCall<WishlistIdsResponse>(url),
    select: (res) => res.data.data.eventIds,
    enabled,
  });
};

export const useToggleWishlist = (options: MutationConfig<void, ToggleWishlistVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.toggleWishlist();
  const { onSuccess, onError } = useQueryHandlers<void, ToggleWishlistVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ eventId, inWishlist }) => {
      if (inWishlist) await deleteCall(wishlistPaths.remove(eventId));
      else await postCall(wishlistPaths.add(eventId));
    },
    onSuccess,
    onError,
  });
};
