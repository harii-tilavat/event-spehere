import { useMutation } from "@tanstack/react-query";
import { deleteCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { categoryPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";

export const useDeleteCategory = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.deleteCategory();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await deleteCall(categoryPaths.delete(id));
    },
    onSuccess,
    onError,
  });
};
