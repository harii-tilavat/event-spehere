export const dashboardPaths = {
  admin: () => "/dashboard/admin",
  organizer: () => "/dashboard/organizer",
  attendee: () => "/dashboard/attendee",
} as const;

export const reportPaths = {
  revenue: () => "/reports/revenue",
  bookings: () => "/reports/bookings",
  attendance: () => "/reports/attendance",
} as const;
