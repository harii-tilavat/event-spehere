import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { AuthMessage, ChangePasswordInput, MessageResponse } from "./types";

export const useChangePassword = (options: MutationConfig<AuthMessage, ChangePasswordInput> = {}) => {
  const { mutationKey, url } = mutationEndpoints.changePassword();
  const { onSuccess, onError } = useQueryHandlers<AuthMessage, ChangePasswordInput>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => ({ message: (await postCall<MessageResponse>(url!, body)).data.message }),
    onSuccess,
    onError,
  });
};
