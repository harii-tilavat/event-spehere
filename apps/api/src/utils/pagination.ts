import type { Meta, PaginationQuery } from "@eventsphere/shared";

export interface PageOptions {
  limit: number;
  offset: number;
}

export function pageOptions(query: Pick<PaginationQuery, "page" | "limit">): PageOptions {
  return { limit: query.limit, offset: (query.page - 1) * query.limit };
}

export function buildMeta(query: Pick<PaginationQuery, "page" | "limit">, total: number): Meta {
  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}
