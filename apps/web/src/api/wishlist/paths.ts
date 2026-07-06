export const wishlistPaths = {
  list: () => "/wishlist",
  ids: () => "/wishlist/ids",
  add: (eventId: number) => `/wishlist/${eventId}`,
  remove: (eventId: number) => `/wishlist/${eventId}`,
} as const;
