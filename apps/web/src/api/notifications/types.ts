import type { ApiSuccess, Meta, NotificationDto } from "@eventsphere/shared";

export type { NotificationDto };

export type NotificationsResponse = ApiSuccess<{ notifications: NotificationDto[]; unread: number }>;

export interface NotificationsPage {
  rows: NotificationDto[];
  unread: number;
  meta?: Meta;
}
