import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { venuePaths } from "./paths";
import type { GetVenuesParams } from "./types";

export const queryEndpoints = {
  getVenues: (params?: GetVenuesParams): QueryEndpoint => ({
    url: venuePaths.list(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("venues", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getVenue: (id: number): QueryEndpoint => ({
    url: venuePaths.detail(id),
    queryKey: buildKey("venues", "detail", id),
  }),
};

export const mutationEndpoints = {
  createVenue: (): MutationEndpoint => ({
    mutationKey: buildKey("venues", "create"),
    url: venuePaths.create(),
    invalidateKeys: [queryEndpoints.getVenues().queryKey],
  }),
  updateVenue: (): MutationEndpoint => ({
    mutationKey: buildKey("venues", "update"),
    invalidateKeys: [queryEndpoints.getVenues().queryKey],
  }),
  deleteVenue: (): MutationEndpoint => ({
    mutationKey: buildKey("venues", "delete"),
    invalidateKeys: [queryEndpoints.getVenues().queryKey],
  }),
};
