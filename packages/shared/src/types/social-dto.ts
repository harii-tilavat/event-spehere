export interface ReviewDto {
  id: number;
  rating: number;
  comment: string | null;
  attendeeName: string;
  organizerReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  /** true when the current viewer wrote this review */
  isMine: boolean;
}

export interface ReviewSummaryDto {
  average: number;
  count: number;
}

export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  body: string;
  channel: "email" | "in_app";
  isRead: boolean;
  createdAt: string;
}
