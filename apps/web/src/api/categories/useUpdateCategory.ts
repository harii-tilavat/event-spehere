import { useMutation } from "@tanstack/react-query";
import { patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { categoryPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type { CategoryDto, CategoryResponse, UpdateCategoryVariables } from "./types";

export const useUpdateCategory = (options: MutationConfig<CategoryDto, UpdateCategoryVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.updateCategory();
  const { onSuccess, onError } = useQueryHandlers<CategoryDto, UpdateCategoryVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, data }) => (await patchCall<CategoryResponse>(categoryPaths.update(id), data)).data.data.category,
    onSuccess,
    onError,
  });
};
