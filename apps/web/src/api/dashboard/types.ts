import type { ApiSuccess, BookingDto, EventListItemDto } from "@eventsphere/shared";

export type DashboardRange = "7d" | "30d" | "90d" | "all";

export interface SeriesPoint {
  date: string;
  revenuePaise: number;
  bookings: number;
}

export interface AdminDashboardDto {
  totals: {
    users: number;
    organizers: number;
    publishedEvents: number;
    pendingApprovals: number;
    confirmedBookings: number;
    revenuePaise: number;
  };
  revenueSeries: SeriesPoint[];
  bookingsByCategory: { category: string; bookings: number }[];
  recentBookings: BookingDto[];
}

export interface OrganizerDashboardDto {
  totals: {
    events: number;
    published: number;
    pendingApprovals: number;
    ticketsSold: number;
    revenuePaise: number;
    attendanceRate: number;
  };
  revenueSeries: SeriesPoint[];
  upcomingEvents: EventListItemDto[];
}

export interface AttendeeDashboardDto {
  upcomingBookings: BookingDto[];
  totals: { confirmed: number; attended: number };
}

export type AdminDashboardResponse = ApiSuccess<AdminDashboardDto>;
export type OrganizerDashboardResponse = ApiSuccess<OrganizerDashboardDto>;
export type AttendeeDashboardResponse = ApiSuccess<AttendeeDashboardDto>;

export type ReportKind = "revenue" | "bookings" | "attendance";
