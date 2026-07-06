import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { AuthMessage, MessageResponse } from "./types";

export const useForgotPassword = (options: MutationConfig<AuthMessage, string> = {}) => {
  const { mutationKey, url } = mutationEndpoints.forgotPassword();
  const { onSuccess, onError } = useQueryHandlers<AuthMessage, string>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (email) => ({ message: (await postCall<MessageResponse>(url!, { email })).data.message }),
    onSuccess,
    onError,
  });
};
