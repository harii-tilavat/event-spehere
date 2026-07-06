import type {
  ApiSuccess,
  EventDetailDto,
  EventListItemDto,
  EventStatus,
  Meta,
  OrganizerEventDto,
} from "@eventsphere/shared";

export type { EventDetailDto, EventListItemDto, EventStatus, OrganizerEventDto };

export interface GetEventsParams {
  page?: number;
  search?: string;
  categoryId?: number;
  city?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetEventsByStatusParams {
  page?: number;
  search?: string;
  status?: EventStatus;
}

/** Dates travel as ISO strings; the API coerces + validates (shared eventCreateSchema). */
export interface EventPayload {
  title: string;
  description: string;
  categoryId: number;
  venueId: number;
  bannerUrl?: string | null;
  galleryImages: string[];
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  capacity: number;
}

export type EventsResponse = ApiSuccess<{ events: EventListItemDto[] }>;
export type OrganizerEventsResponse = ApiSuccess<{ events: OrganizerEventDto[] }>;
export type EventDetailResponse = ApiSuccess<{ event: EventDetailDto }>;

export interface EventsPage {
  rows: EventListItemDto[];
  meta?: Meta;
}

export interface OrganizerEventsPage {
  rows: OrganizerEventDto[];
  meta?: Meta;
}

export interface UpdateEventVariables {
  id: number;
  data: EventPayload;
}

export interface RejectEventVariables {
  id: number;
  reason: string;
}
