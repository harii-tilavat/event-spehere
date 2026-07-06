import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { HealthResponse } from "./types";

export const useGetHealth = () => {
  const { queryKey, url } = queryEndpoints.getHealth();
  return useQuery({
    queryKey,
    queryFn: () => getCall<HealthResponse>(url),
    select: (res) => res.data.data,
    refetchInterval: 30_000,
  });
};
