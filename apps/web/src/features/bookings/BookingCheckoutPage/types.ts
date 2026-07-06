import type { BookingDto, CheckoutInfoDto } from "@eventsphere/shared";

export type CheckoutStep = "select" | "pay" | "done";

export interface ActiveCheckout {
  booking: BookingDto;
  checkout: CheckoutInfoDto;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  theme?: { color: string };
}
