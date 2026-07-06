import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { bookingPaths, paymentPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type {
  BookingCreateInput,
  BookingDto,
  BookingResponse,
  CreateBookingResponse,
  CreateBookingResult,
  MockCheckoutResponse,
  MockCheckoutVariables,
  PaymentListItemDto,
  PaymentResponse,
  PaymentVerifyInput,
} from "./types";

export const useCreateBooking = (options: MutationConfig<CreateBookingResult, BookingCreateInput> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.createBooking();
  const { onSuccess, onError } = useQueryHandlers<CreateBookingResult, BookingCreateInput>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<CreateBookingResponse>(url!, body)).data.data,
    onSuccess,
    onError,
  });
};

export const useCancelBooking = (options: MutationConfig<BookingDto, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.cancelBooking();
  const { onSuccess, onError } = useQueryHandlers<BookingDto, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => (await postCall<BookingResponse>(bookingPaths.cancel(id))).data.data.booking,
    onSuccess,
    onError,
  });
};

export const useVerifyPayment = (options: MutationConfig<BookingDto, PaymentVerifyInput> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.verifyPayment();
  const { onSuccess, onError } = useQueryHandlers<BookingDto, PaymentVerifyInput>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<BookingResponse>(url!, body)).data.data.booking,
    onSuccess,
    onError,
  });
};

export type MockCheckoutResult = { razorpayPaymentId: string; razorpaySignature: string } | { declined: true };

export const useMockCheckout = (options: MutationConfig<MockCheckoutResult, MockCheckoutVariables> = {}) => {
  const { mutationKey, url } = mutationEndpoints.mockCheckout();
  const { onSuccess, onError } = useQueryHandlers<MockCheckoutResult, MockCheckoutVariables>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<MockCheckoutResponse>(url!, body)).data.data,
    onSuccess,
    onError,
  });
};

export const useRefundPayment = (options: MutationConfig<PaymentListItemDto, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.refundPayment();
  const { onSuccess, onError } = useQueryHandlers<PaymentListItemDto, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => (await postCall<PaymentResponse>(paymentPaths.refund(id))).data.data.payment,
    onSuccess,
    onError,
  });
};
