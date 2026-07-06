import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { getCall, patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { notificationPaths } from "./paths";
import { mutationEndpoints, queryEndpoints } from "./endpoints";
import type { NotificationsPage, NotificationsResponse } from "./types";

export const useGetNotifications = (params?: { page?: number }) => {
  const { queryKey, url } = queryEndpoints.getNotifications(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<NotificationsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): NotificationsPage => ({
      rows: res.data.data.notifications,
      unread: res.data.data.unread,
      meta: res.data.meta,
    }),
    placeholderData: keepPreviousData,
  });
};

export const useMarkNotificationRead = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.markRead();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await patchCall(notificationPaths.markRead(id));
    },
    onSuccess,
    onError,
  });
};

export const useMarkAllNotificationsRead = (options: MutationConfig<void, void> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.markAllRead();
  const { onSuccess, onError } = useQueryHandlers<void, void>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async () => {
      await patchCall(url!);
    },
    onSuccess,
    onError,
  });
};
