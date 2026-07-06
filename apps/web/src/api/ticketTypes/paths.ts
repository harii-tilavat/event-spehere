export const ticketTypePaths = {
  listForEvent: (eventId: number) => `/events/${eventId}/ticket-types`,
  create: (eventId: number) => `/events/${eventId}/ticket-types`,
  update: (id: number) => `/ticket-types/${id}`,
  delete: (id: number) => `/ticket-types/${id}`,
} as const;
