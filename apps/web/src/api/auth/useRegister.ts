import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { AuthData, AuthResponse, RegisterInput } from "./types";

export const useRegister = (options: MutationConfig<AuthData, RegisterInput> = {}) => {
  const { mutationKey, url } = mutationEndpoints.register();
  const { onSuccess, onError } = useQueryHandlers<AuthData, RegisterInput>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<AuthResponse>(url!, body)).data.data,
    onSuccess,
    onError,
  });
};
