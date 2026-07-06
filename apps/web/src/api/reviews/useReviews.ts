import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteCall, getCall, postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { reviewPaths } from "./paths";
import { mutationEndpoints, queryEndpoints } from "./endpoints";
import type { CreateReviewVariables, ReplyReviewVariables, ReviewDto, ReviewResponse, ReviewsResponse } from "./types";

export const useGetEventReviews = (eventId: number | undefined, options?: { enabled?: boolean }) => {
  const { queryKey, url } = queryEndpoints.getEventReviews(eventId);
  return useQuery({
    queryKey,
    queryFn: () => getCall<ReviewsResponse>(url),
    select: (res) => res.data.data,
    enabled: !!eventId && (options?.enabled ?? true),
  });
};

export const useCreateReview = (options: MutationConfig<ReviewDto, CreateReviewVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.createReview();
  const { onSuccess, onError } = useQueryHandlers<ReviewDto, CreateReviewVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ eventId, ...body }) =>
      (await postCall<ReviewResponse>(reviewPaths.create(eventId), body)).data.data.review,
    onSuccess,
    onError,
  });
};

export const useReplyReview = (options: MutationConfig<ReviewDto, ReplyReviewVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.replyReview();
  const { onSuccess, onError } = useQueryHandlers<ReviewDto, ReplyReviewVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, reply }) => (await postCall<ReviewResponse>(reviewPaths.reply(id), { reply })).data.data.review,
    onSuccess,
    onError,
  });
};

export const useDeleteReview = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.deleteReview();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await deleteCall(reviewPaths.delete(id));
    },
    onSuccess,
    onError,
  });
};
