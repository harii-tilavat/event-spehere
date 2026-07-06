import { useMutation } from "@tanstack/react-query";
import { postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { MeResponse, VerifyEmailResult } from "./types";

export const useVerifyEmail = (options: MutationConfig<VerifyEmailResult, string> = {}) => {
  const { mutationKey, url } = mutationEndpoints.verifyEmail();
  const { onSuccess, onError } = useQueryHandlers<VerifyEmailResult, string>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (token) => (await postCall<MeResponse>(url!, { token })).data.data,
    onSuccess,
    onError,
  });
};
