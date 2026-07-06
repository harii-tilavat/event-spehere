import type { ApiSuccess, Meta, VenueCreateInput, VenueDto, VenueUpdateInput } from "@eventsphere/shared";

export type { VenueCreateInput, VenueDto, VenueUpdateInput };

export interface GetVenuesParams {
  page?: number;
  search?: string;
  city?: string;
}

export type VenuesResponse = ApiSuccess<{ venues: VenueDto[] }>;
export type VenueResponse = ApiSuccess<{ venue: VenueDto }>;

export interface VenuesPage {
  rows: VenueDto[];
  meta?: Meta;
}

export interface UpdateVenueVariables {
  id: number;
  data: VenueUpdateInput;
}
