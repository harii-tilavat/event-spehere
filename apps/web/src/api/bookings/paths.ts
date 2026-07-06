export const bookingPaths = {
  create: () => "/bookings",
  mine: () => "/bookings/me",
  detail: (id: number) => `/bookings/${id}`,
  cancel: (id: number) => `/bookings/${id}/cancel`,
  forEvent: (eventId: number) => `/events/${eventId}/bookings`,
  adminList: () => "/admin/bookings",
} as const;

export const paymentPaths = {
  verify: () => "/payments/verify",
  mockCheckout: () => "/payments/mock-checkout",
  list: () => "/payments",
  refund: (id: number) => `/payments/${id}/refund`,
} as const;
