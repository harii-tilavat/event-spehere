import type {
  ApiSuccess,
  Meta,
  OrganizerApplicationDto,
  OrganizerDecisionInput,
  OrganizerProfileDto,
  OrganizerProfileUpdateInput,
} from "@eventsphere/shared";

export type { OrganizerApplicationDto, OrganizerDecisionInput, OrganizerProfileDto, OrganizerProfileUpdateInput };

export interface GetOrganizersParams {
  page?: number;
  search?: string;
  approvalStatus?: string;
}

export type OrganizersResponse = ApiSuccess<{ organizers: OrganizerApplicationDto[] }>;
export type OrganizerProfileResponse = ApiSuccess<{ organizer: OrganizerProfileDto }>;

export interface OrganizersPage {
  rows: OrganizerApplicationDto[];
  meta?: Meta;
}

export interface DecideOrganizerVariables extends OrganizerDecisionInput {
  id: number;
}
