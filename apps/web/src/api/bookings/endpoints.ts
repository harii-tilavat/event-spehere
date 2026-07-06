import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { bookingPaths, paymentPaths } from "./paths";
import type { GetBookingsParams } from "./types";

export const queryEndpoints = {
  getMyBookings: (params?: GetBookingsParams): QueryEndpoint => ({
    url: bookingPaths.mine(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("bookings", "mine", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getBooking: (id?: number): QueryEndpoint => ({
    url: bookingPaths.detail(id ?? 0),
    queryKey: buildKey("bookings", "detail", id),
  }),
  getEventBookings: (eventId?: number, params?: GetBookingsParams): QueryEndpoint => ({
    url: bookingPaths.forEvent(eventId ?? 0),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("bookings", "event", eventId, normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getAdminBookings: (params?: GetBookingsParams): QueryEndpoint => ({
    url: bookingPaths.adminList(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("bookings", "admin", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getPayments: (params?: Record<string, unknown>): QueryEndpoint => ({
    url: paymentPaths.list(),
    params,
    queryKey: buildKey("payments", "list", normalizeParams(params)),
  }),
};

/** Booking mutations change availability too → invalidate events as well. */
const bookingKeys = () => [buildKey("bookings"), buildKey("events")];

export const mutationEndpoints = {
  createBooking: (): MutationEndpoint => ({
    mutationKey: buildKey("bookings", "create"),
    url: bookingPaths.create(),
    invalidateKeys: bookingKeys(),
  }),
  cancelBooking: (): MutationEndpoint => ({
    mutationKey: buildKey("bookings", "cancel"),
    invalidateKeys: bookingKeys(),
  }),
  verifyPayment: (): MutationEndpoint => ({
    mutationKey: buildKey("payments", "verify"),
    url: paymentPaths.verify(),
    invalidateKeys: bookingKeys(),
  }),
  mockCheckout: (): MutationEndpoint => ({
    mutationKey: buildKey("payments", "mockCheckout"),
    url: paymentPaths.mockCheckout(),
  }),
  refundPayment: (): MutationEndpoint => ({
    mutationKey: buildKey("payments", "refund"),
    invalidateKeys: [...bookingKeys(), queryEndpoints.getPayments().queryKey],
  }),
};
