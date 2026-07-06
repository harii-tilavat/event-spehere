import type { EventStatus } from "../constants/enums.js";
import type { CategoryDto, VenueDto } from "./catalog-dto.js";

export interface TicketTypeDto {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  quantityTotal: number;
  quantitySold: number;
  remaining: number;
  maxPerBooking: number;
  saleStart: string | null;
  saleEnd: string | null;
  isActive: boolean;
  /** true when the sale window is open and stock remains */
  isOnSale: boolean;
}

export interface EventListItemDto {
  id: number;
  title: string;
  slug: string;
  bannerUrl: string | null;
  status: EventStatus;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  capacity: number;
  isFeatured: boolean;
  city: string;
  venueName: string;
  categoryName: string;
  /** cheapest active ticket in paise; null when no tickets defined */
  minPricePaise: number | null;
}

export interface EventOrganizerInfoDto {
  id: number;
  organizationName: string;
  logoUrl: string | null;
}

export interface EventDetailDto extends EventListItemDto {
  description: string;
  galleryImages: string[];
  venue: VenueDto;
  category: CategoryDto;
  organizer: EventOrganizerInfoDto;
  ticketTypes: TicketTypeDto[];
  rejectionReason: string | null;
}

export interface OrganizerEventDto extends EventListItemDto {
  rejectionReason: string | null;
  ticketTypesCount: number;
  ticketsSold: number;
}
