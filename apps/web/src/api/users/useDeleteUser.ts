import { useMutation } from "@tanstack/react-query";
import { deleteCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { userPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";

export const useDeleteUser = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.deleteUser();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await deleteCall(userPaths.delete(id));
    },
    onSuccess,
    onError,
  });
};
