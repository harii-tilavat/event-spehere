import type { ApiSuccess, TicketDto } from "@eventsphere/shared";

export type { TicketDto };

export interface CheckInResultDto {
  ticket: TicketDto;
  attendeeName: string;
  eventTitle: string;
}

export type CheckInResponse = ApiSuccess<CheckInResultDto>;

export interface ManualCheckInLookupDto {
  bookingNumber: string;
  attendeeName: string;
  eventTitle: string;
  tickets: TicketDto[];
}

export type ManualCheckInResponse = ApiSuccess<ManualCheckInLookupDto>;
