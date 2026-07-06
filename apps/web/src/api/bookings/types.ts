import type {
  ApiSuccess,
  BookingCreateInput,
  BookingDto,
  BookingStatus,
  CheckoutInfoDto,
  Meta,
  PaymentListItemDto,
  PaymentVerifyInput,
} from "@eventsphere/shared";

export type { BookingCreateInput, BookingDto, CheckoutInfoDto, PaymentListItemDto, PaymentVerifyInput };

export interface GetBookingsParams {
  page?: number;
  status?: BookingStatus;
  eventId?: number;
  search?: string;
}

export type BookingResponse = ApiSuccess<{ booking: BookingDto }>;
export type BookingsResponse = ApiSuccess<{ bookings: BookingDto[] }>;
export type CreateBookingResponse = ApiSuccess<{ booking: BookingDto; checkout: CheckoutInfoDto }>;
export type MockCheckoutResponse = ApiSuccess<{ razorpayPaymentId: string; razorpaySignature: string } | { declined: true }>;
export type PaymentsResponse = ApiSuccess<{ payments: PaymentListItemDto[] }>;
export type PaymentResponse = ApiSuccess<{ payment: PaymentListItemDto }>;

export interface BookingsPage {
  rows: BookingDto[];
  meta?: Meta;
}

export interface PaymentsPage {
  rows: PaymentListItemDto[];
  meta?: Meta;
}

export interface CreateBookingResult {
  booking: BookingDto;
  checkout: CheckoutInfoDto;
}

export interface MockCheckoutVariables {
  orderId: string;
  outcome: "success" | "failure";
}
