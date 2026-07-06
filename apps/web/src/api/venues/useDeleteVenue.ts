import { useMutation } from "@tanstack/react-query";
import { deleteCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { venuePaths } from "./paths";
import { mutationEndpoints } from "./endpoints";

export const useDeleteVenue = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.deleteVenue();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await deleteCall(venuePaths.delete(id));
    },
    onSuccess,
    onError,
  });
};
