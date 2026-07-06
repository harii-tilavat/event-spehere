import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { userPaths } from "./paths";
import type { GetUsersParams } from "./types";

export const queryEndpoints = {
  getUsers: (params?: GetUsersParams): QueryEndpoint => ({
    url: userPaths.list(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("users", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
};

export const mutationEndpoints = {
  setUserStatus: (): MutationEndpoint => ({
    mutationKey: buildKey("users", "status"),
    invalidateKeys: [queryEndpoints.getUsers().queryKey],
  }),
  deleteUser: (): MutationEndpoint => ({
    mutationKey: buildKey("users", "delete"),
    invalidateKeys: [queryEndpoints.getUsers().queryKey],
  }),
  updateProfile: (): MutationEndpoint => ({
    mutationKey: buildKey("users", "updateProfile"),
    url: userPaths.me(),
  }),
};
