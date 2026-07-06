import { useMutation } from "@tanstack/react-query";
import { patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { userPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type { SetUserStatusVariables, UserDto, UserResponse } from "./types";

export const useSetUserStatus = (options: MutationConfig<UserDto, SetUserStatusVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.setUserStatus();
  const { onSuccess, onError } = useQueryHandlers<UserDto, SetUserStatusVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, status }) => (await patchCall<UserResponse>(userPaths.status(id), { status })).data.data.user,
    onSuccess,
    onError,
  });
};
