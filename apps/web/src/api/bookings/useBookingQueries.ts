import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { BookingDto, BookingResponse, BookingsPage, BookingsResponse, GetBookingsParams, PaymentsPage, PaymentsResponse } from "./types";

export const useGetMyBookings = (params?: GetBookingsParams) => {
  const { queryKey, url } = queryEndpoints.getMyBookings(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<BookingsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): BookingsPage => ({ rows: res.data.data.bookings, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};

export const useGetBooking = (id: number | undefined, options?: { pollWhilePending?: boolean }) => {
  const { queryKey, url } = queryEndpoints.getBooking(id);
  return useQuery({
    queryKey,
    queryFn: () => getCall<BookingResponse>(url),
    select: (res) => res.data.data.booking,
    enabled: !!id,
    // webhook-confirmed payments appear without user action (docs/05 §4)
    refetchInterval: options?.pollWhilePending
      ? (query) => ((query.state.data?.data.data.booking as BookingDto | undefined)?.status === "pending" ? 3000 : false)
      : false,
  });
};

export const useGetEventBookings = (eventId: number | undefined, params?: GetBookingsParams) => {
  const { queryKey, url } = queryEndpoints.getEventBookings(eventId, params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<BookingsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): BookingsPage => ({ rows: res.data.data.bookings, meta: res.data.meta }),
    enabled: !!eventId,
    placeholderData: keepPreviousData,
  });
};

export const useGetAdminBookings = (params?: GetBookingsParams) => {
  const { queryKey, url } = queryEndpoints.getAdminBookings(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<BookingsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): BookingsPage => ({ rows: res.data.data.bookings, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};

export const useGetPayments = (params?: { page?: number; status?: string }) => {
  const { queryKey, url } = queryEndpoints.getPayments(params as Record<string, unknown> | undefined);
  return useQuery({
    queryKey,
    queryFn: () => getCall<PaymentsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): PaymentsPage => ({ rows: res.data.data.payments, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};
