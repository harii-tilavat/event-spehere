import type { OrganizerApplicationDto } from "@eventsphere/shared";

export interface DecisionDialogState {
  organizer: OrganizerApplicationDto;
  action: "approve" | "reject";
}
