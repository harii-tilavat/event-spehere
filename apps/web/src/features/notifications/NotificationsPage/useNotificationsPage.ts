import { useState } from "react";
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/api";

export function useNotificationsPage() {
  const [page, setPage] = useState(1);
  const notificationsQuery = useGetNotifications({ page });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return {
    notifications: notificationsQuery.data?.rows ?? [],
    unread: notificationsQuery.data?.unread ?? 0,
    meta: notificationsQuery.data?.meta,
    isLoading: notificationsQuery.isPending,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    setPage,
    isMarkingAll: markAllRead.isPending,
    handleMarkRead: (id: number) => markRead.mutate(id),
    handleMarkAllRead: () => markAllRead.mutate(),
  };
}
