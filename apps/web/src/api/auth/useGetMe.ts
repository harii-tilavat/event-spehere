import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { MeResponse } from "./types";

export const useGetMe = (enabled = true) => {
  const { queryKey, url } = queryEndpoints.getMe();
  return useQuery({
    queryKey,
    queryFn: () => getCall<MeResponse>(url),
    select: (res) => res.data.data.user,
    enabled,
  });
};
