import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { GetOrganizersParams, OrganizersPage, OrganizersResponse } from "./types";

export const useGetOrganizers = (params?: GetOrganizersParams) => {
  const { queryKey, url } = queryEndpoints.getOrganizers(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<OrganizersResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): OrganizersPage => ({ rows: res.data.data.organizers, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};
