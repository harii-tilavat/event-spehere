import type { ApiSuccess, TicketTypeDto } from "@eventsphere/shared";

export type { TicketTypeDto };

/** Dates travel as ISO strings; the API coerces + validates. */
export interface TicketTypePayload {
  name: string;
  description?: string | null;
  pricePaise: number;
  quantityTotal: number;
  maxPerBooking: number;
  saleStart?: string | null;
  saleEnd?: string | null;
  isActive: boolean;
}

export type TicketTypesResponse = ApiSuccess<{ ticketTypes: TicketTypeDto[] }>;
export type TicketTypeResponse = ApiSuccess<{ ticketType: TicketTypeDto }>;

export interface CreateTicketTypeVariables {
  eventId: number;
  data: TicketTypePayload;
}

export interface UpdateTicketTypeVariables {
  id: number;
  data: Partial<TicketTypePayload>;
}
