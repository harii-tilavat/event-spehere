import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { notificationPaths } from "./paths";

export const queryEndpoints = {
  getNotifications: (params?: { page?: number }): QueryEndpoint => ({
    url: notificationPaths.list(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("notifications", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
};

export const mutationEndpoints = {
  markRead: (): MutationEndpoint => ({
    mutationKey: buildKey("notifications", "markRead"),
    invalidateKeys: [queryEndpoints.getNotifications().queryKey],
  }),
  markAllRead: (): MutationEndpoint => ({
    mutationKey: buildKey("notifications", "markAllRead"),
    url: notificationPaths.markAllRead(),
    invalidateKeys: [queryEndpoints.getNotifications().queryKey],
  }),
};
