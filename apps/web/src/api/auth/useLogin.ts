import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { AuthData, AuthResponse, LoginInput } from "./types";

export const useLogin = (options: MutationConfig<AuthData, LoginInput> = {}) => {
  const { mutationKey, url } = mutationEndpoints.login();
  const { onSuccess, onError } = useQueryHandlers<AuthData, LoginInput>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<AuthResponse>(url!, body)).data.data,
    onSuccess,
    onError,
  });
};
