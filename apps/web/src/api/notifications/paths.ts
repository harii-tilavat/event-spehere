export const notificationPaths = {
  list: () => "/notifications",
  markRead: (id: number) => `/notifications/${id}/read`,
  markAllRead: () => "/notifications/read-all",
} as const;
