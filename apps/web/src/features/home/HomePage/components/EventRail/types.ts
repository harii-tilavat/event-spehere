import type { EventListItemDto } from "@eventsphere/shared";

export interface EventRailProps {
  title: string;
  description?: string;
  events: EventListItemDto[];
  isLoading: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
}
