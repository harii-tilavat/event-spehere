import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { categoryPaths } from "./paths";
import type { GetCategoriesParams } from "./types";

export const queryEndpoints = {
  getCategories: (params?: GetCategoriesParams): QueryEndpoint => ({
    url: categoryPaths.list(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("categories", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
};

export const mutationEndpoints = {
  createCategory: (): MutationEndpoint => ({
    mutationKey: buildKey("categories", "create"),
    url: categoryPaths.create(),
    invalidateKeys: [queryEndpoints.getCategories().queryKey],
  }),
  updateCategory: (): MutationEndpoint => ({
    mutationKey: buildKey("categories", "update"),
    invalidateKeys: [queryEndpoints.getCategories().queryKey],
  }),
  deleteCategory: (): MutationEndpoint => ({
    mutationKey: buildKey("categories", "delete"),
    invalidateKeys: [queryEndpoints.getCategories().queryKey],
  }),
};
