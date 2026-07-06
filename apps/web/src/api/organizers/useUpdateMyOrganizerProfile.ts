import { useMutation } from "@tanstack/react-query";
import { patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { OrganizerProfileDto, OrganizerProfileResponse, OrganizerProfileUpdateInput } from "./types";

export const useUpdateMyOrganizerProfile = (
  options: MutationConfig<OrganizerProfileDto, OrganizerProfileUpdateInput> = {},
) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.updateMyOrganizerProfile();
  const { onSuccess, onError } = useQueryHandlers<OrganizerProfileDto, OrganizerProfileUpdateInput>({
    invalidateKeys,
    options,
  });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await patchCall<OrganizerProfileResponse>(url!, body)).data.data.organizer,
    onSuccess,
    onError,
  });
};
