import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { AuthMessage, MessageResponse, ResetPasswordInput } from "./types";

export const useResetPassword = (options: MutationConfig<AuthMessage, ResetPasswordInput> = {}) => {
  const { mutationKey, url } = mutationEndpoints.resetPassword();
  const { onSuccess, onError } = useQueryHandlers<AuthMessage, ResetPasswordInput>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => ({ message: (await postCall<MessageResponse>(url!, body)).data.message }),
    onSuccess,
    onError,
  });
};
