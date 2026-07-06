import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { organizerPaths } from "./paths";
import type { GetOrganizersParams } from "./types";

export const queryEndpoints = {
  getOrganizers: (params?: GetOrganizersParams): QueryEndpoint => ({
    url: organizerPaths.list(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("organizers", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getMyOrganizerProfile: (): QueryEndpoint => ({
    url: organizerPaths.me(),
    queryKey: buildKey("organizers", "me"),
  }),
};

export const mutationEndpoints = {
  decideOrganizer: (): MutationEndpoint => ({
    mutationKey: buildKey("organizers", "decide"),
    invalidateKeys: [queryEndpoints.getOrganizers().queryKey],
  }),
  updateMyOrganizerProfile: (): MutationEndpoint => ({
    mutationKey: buildKey("organizers", "updateMe"),
    url: organizerPaths.me(),
    invalidateKeys: [queryEndpoints.getMyOrganizerProfile().queryKey],
  }),
};
