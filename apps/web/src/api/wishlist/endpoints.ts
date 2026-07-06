import { buildKey, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { wishlistPaths } from "./paths";

export const queryEndpoints = {
  getWishlist: (): QueryEndpoint => ({
    url: wishlistPaths.list(),
    queryKey: buildKey("wishlist", "list"),
  }),
  getWishlistIds: (): QueryEndpoint => ({
    url: wishlistPaths.ids(),
    queryKey: buildKey("wishlist", "ids"),
  }),
};

export const mutationEndpoints = {
  toggleWishlist: (): MutationEndpoint => ({
    mutationKey: buildKey("wishlist", "toggle"),
    invalidateKeys: [queryEndpoints.getWishlist().queryKey, queryEndpoints.getWishlistIds().queryKey],
  }),
};
