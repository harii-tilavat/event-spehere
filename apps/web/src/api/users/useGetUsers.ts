import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { GetUsersParams, UsersPage, UsersResponse } from "./types";

export const useGetUsers = (params?: GetUsersParams) => {
  const { queryKey, url } = queryEndpoints.getUsers(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<UsersResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): UsersPage => ({ rows: res.data.data.users, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};
