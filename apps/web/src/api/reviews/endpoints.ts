import { buildKey, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { reviewPaths } from "./paths";

export const queryEndpoints = {
  getEventReviews: (eventId?: number): QueryEndpoint => ({
    url: reviewPaths.listForEvent(eventId ?? 0),
    queryKey: buildKey("reviews", "event", eventId),
  }),
};

const reviewKeys = () => [queryEndpoints.getEventReviews().queryKey];

export const mutationEndpoints = {
  createReview: (): MutationEndpoint => ({
    mutationKey: buildKey("reviews", "create"),
    invalidateKeys: reviewKeys(),
  }),
  replyReview: (): MutationEndpoint => ({
    mutationKey: buildKey("reviews", "reply"),
    invalidateKeys: reviewKeys(),
  }),
  deleteReview: (): MutationEndpoint => ({
    mutationKey: buildKey("reviews", "delete"),
    invalidateKeys: reviewKeys(),
  }),
};
