import { z } from "zod";

/** List conventions per docs/04 §1 — applied by every list endpoint. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sortBy: z.string().trim().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
