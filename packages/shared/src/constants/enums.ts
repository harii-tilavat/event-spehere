export const ROLES = ["super_admin", "organizer", "attendee"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ORGANIZER_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type OrganizerApprovalStatus = (typeof ORGANIZER_APPROVAL_STATUSES)[number];

export const EVENT_STATUSES = [
  "draft",
  "pending_approval",
  "rejected",
  "published",
  "cancelled",
  "completed",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "expired", "refunded"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TICKET_STATUSES = ["valid", "checked_in", "cancelled"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const PAYMENT_STATUSES = ["created", "captured", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "INVALID_CREDENTIALS",
  "EMAIL_NOT_VERIFIED",
  "TOKEN_EXPIRED",
  "ORGANIZER_NOT_APPROVED",
  "SOLD_OUT",
  "BOOKING_EXPIRED",
  "INVALID_STATE",
  "PAYMENT_VERIFICATION_FAILED",
  "ALREADY_CHECKED_IN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/** Booking inventory hold duration (minutes) — see docs/03 §4. */
export const BOOKING_HOLD_MINUTES = 15;
