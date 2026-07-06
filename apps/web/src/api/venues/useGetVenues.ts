import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { GetVenuesParams, VenuesPage, VenuesResponse } from "./types";

export const useGetVenues = (params?: GetVenuesParams) => {
  const { queryKey, url } = queryEndpoints.getVenues(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<VenuesResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): VenuesPage => ({ rows: res.data.data.venues, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};
