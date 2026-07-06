export const organizerPaths = {
  list: () => "/organizers",
  detail: (id: number) => `/organizers/${id}`,
  approval: (id: number) => `/organizers/${id}/approval`,
  me: () => "/organizers/me",
} as const;
