export const ticketPaths = {
  pdf: (code: string) => `/tickets/${code}/pdf`,
  checkIn: () => "/check-in",
  manualCheckIn: () => "/check-in/manual",
} as const;
