import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { CategoryCreateInput, CategoryDto, CategoryResponse } from "./types";

export const useCreateCategory = (options: MutationConfig<CategoryDto, CategoryCreateInput> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.createCategory();
  const { onSuccess, onError } = useQueryHandlers<CategoryDto, CategoryCreateInput>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<CategoryResponse>(url!, body)).data.data.category,
    onSuccess,
    onError,
  });
};
