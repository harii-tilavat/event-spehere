import { useMutation } from "@tanstack/react-query";
import { patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { organizerPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type { DecideOrganizerVariables, OrganizerProfileDto, OrganizerProfileResponse } from "./types";

export const useDecideOrganizer = (options: MutationConfig<OrganizerProfileDto, DecideOrganizerVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.decideOrganizer();
  const { onSuccess, onError } = useQueryHandlers<OrganizerProfileDto, DecideOrganizerVariables>({
    invalidateKeys,
    options,
  });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, ...body }) =>
      (await patchCall<OrganizerProfileResponse>(organizerPaths.approval(id), body)).data.data.organizer,
    onSuccess,
    onError,
  });
};
