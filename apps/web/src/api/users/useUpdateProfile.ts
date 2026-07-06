import { useMutation } from "@tanstack/react-query";
import { patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { mutationEndpoints } from "./endpoints";
import type { UpdateProfileInput, UserDto, UserResponse } from "./types";

export const useUpdateProfile = (options: MutationConfig<UserDto, UpdateProfileInput> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.updateProfile();
  const { onSuccess, onError } = useQueryHandlers<UserDto, UpdateProfileInput>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await patchCall<UserResponse>(url!, body)).data.data.user,
    onSuccess,
    onError,
  });
};
