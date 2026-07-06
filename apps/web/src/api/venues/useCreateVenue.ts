import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { VenueCreateInput, VenueDto, VenueResponse } from "./types";

export const useCreateVenue = (options: MutationConfig<VenueDto, VenueCreateInput> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.createVenue();
  const { onSuccess, onError } = useQueryHandlers<VenueDto, VenueCreateInput>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<VenueResponse>(url!, body)).data.data.venue,
    onSuccess,
    onError,
  });
};
