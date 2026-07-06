export const venuePaths = {
  list: () => "/venues",
  detail: (id: number) => `/venues/${id}`,
  create: () => "/venues",
  update: (id: number) => `/venues/${id}`,
  delete: (id: number) => `/venues/${id}`,
} as const;
