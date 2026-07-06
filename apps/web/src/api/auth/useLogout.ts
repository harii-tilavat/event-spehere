import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";

export const useLogout = (options: MutationConfig<void, void> = {}) => {
  const { mutationKey, url } = mutationEndpoints.logout();
  const { onSuccess, onError } = useQueryHandlers<void, void>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async () => {
      await postCall(url!);
    },
    onSuccess,
    onError,
  });
};
