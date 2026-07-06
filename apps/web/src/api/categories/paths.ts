export const categoryPaths = {
  list: () => "/categories",
  create: () => "/categories",
  update: (id: number) => `/categories/${id}`,
  delete: (id: number) => `/categories/${id}`,
} as const;
