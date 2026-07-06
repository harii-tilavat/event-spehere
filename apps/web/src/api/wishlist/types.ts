import type { ApiSuccess, EventListItemDto } from "@eventsphere/shared";

export type WishlistResponse = ApiSuccess<{ events: EventListItemDto[] }>;
export type WishlistIdsResponse = ApiSuccess<{ eventIds: number[] }>;

export interface ToggleWishlistVariables {
  eventId: number;
  inWishlist: boolean;
}
