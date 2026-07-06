import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { AuthMessage, MessageResponse } from "./types";

export const useResendVerification = (options: MutationConfig<AuthMessage, void> = {}) => {
  const { mutationKey, url } = mutationEndpoints.resendVerification();
  const { onSuccess, onError } = useQueryHandlers<AuthMessage, void>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async () => ({ message: (await postCall<MessageResponse>(url!)).data.message }),
    onSuccess,
    onError,
  });
};
