import { useMutation } from "@tanstack/react-query";
import { patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { venuePaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type { UpdateVenueVariables, VenueDto, VenueResponse } from "./types";

export const useUpdateVenue = (options: MutationConfig<VenueDto, UpdateVenueVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.updateVenue();
  const { onSuccess, onError } = useQueryHandlers<VenueDto, UpdateVenueVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, data }) => (await patchCall<VenueResponse>(venuePaths.update(id), data)).data.data.venue,
    onSuccess,
    onError,
  });
};
