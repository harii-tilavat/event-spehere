export const eventPaths = {
  list: () => "/events",
  detail: (slug: string) => `/events/${slug}`,
  create: () => "/events",
  update: (id: number) => `/events/${id}`,
  delete: (id: number) => `/events/${id}`,
  submit: (id: number) => `/events/${id}/submit`,
  cancel: (id: number) => `/events/${id}/cancel`,
  approve: (id: number) => `/events/${id}/approve`,
  reject: (id: number) => `/events/${id}/reject`,
  feature: (id: number) => `/events/${id}/feature`,
  organizerList: () => "/organizer/events",
  adminList: () => "/admin/events",
} as const;
