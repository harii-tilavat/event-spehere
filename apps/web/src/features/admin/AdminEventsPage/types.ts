import type { OrganizerEventDto } from "@eventsphere/shared";

export interface AdminEventsPageProps {
  /** "approvals" pins the queue to pending_approval; "all" shows every status with a filter. */
  mode: "approvals" | "all";
}

export interface RejectDialogState {
  event: OrganizerEventDto;
}
