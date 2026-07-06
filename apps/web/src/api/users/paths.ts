export const userPaths = {
  list: () => "/users",
  detail: (id: number) => `/users/${id}`,
  status: (id: number) => `/users/${id}/status`,
  delete: (id: number) => `/users/${id}`,
  me: () => "/users/me",
} as const;
