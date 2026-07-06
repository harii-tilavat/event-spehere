import type { BookingStatus, PaymentStatus, TicketStatus } from "../constants/enums.js";

export interface BookingItemDto {
  id: number;
  ticketTypeId: number;
  ticketTypeName: string;
  quantity: number;
  unitPricePaise: number;
  subtotalPaise: number;
}

export interface TicketDto {
  id: number;
  ticketCode: string;
  /** Signed payload encoded in the QR image — `code.signature` */
  qrPayload: string;
  status: TicketStatus;
  ticketTypeName: string;
  checkedInAt: string | null;
}

export interface BookingEventInfoDto {
  id: number;
  title: string;
  slug: string;
  bannerUrl: string | null;
  startTime: string;
  venueName: string;
  city: string;
}

export interface BookingPaymentInfoDto {
  orderId: string;
  status: PaymentStatus;
  method: string | null;
}

export interface BookingDto {
  id: number;
  bookingNumber: string;
  status: BookingStatus;
  totalAmountPaise: number;
  expiresAt: string | null;
  createdAt: string;
  event: BookingEventInfoDto;
  items: BookingItemDto[];
  tickets: TicketDto[];
  payment: BookingPaymentInfoDto | null;
  /** attendee info — present for organizer/admin views */
  attendee?: { id: number; name: string; email: string } | null;
}

export type PaymentProviderName = "razorpay" | "mock";

export interface CheckoutInfoDto {
  provider: PaymentProviderName;
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export interface CreateBookingResultDto {
  booking: BookingDto;
  checkout: CheckoutInfoDto;
}

export interface PaymentListItemDto {
  id: number;
  bookingId: number;
  bookingNumber: string;
  eventTitle: string;
  attendeeEmail: string;
  orderId: string;
  paymentId: string | null;
  amountPaise: number;
  status: PaymentStatus;
  method: string | null;
  errorReason: string | null;
  createdAt: string;
}
