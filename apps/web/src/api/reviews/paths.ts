export const reviewPaths = {
  listForEvent: (eventId: number) => `/events/${eventId}/reviews`,
  create: (eventId: number) => `/events/${eventId}/reviews`,
  reply: (id: number) => `/reviews/${id}/reply`,
  delete: (id: number) => `/reviews/${id}`,
} as const;
