import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { GetEventsByStatusParams, OrganizerEventsPage, OrganizerEventsResponse } from "./types";

export const useGetAdminEvents = (params?: GetEventsByStatusParams) => {
  const { queryKey, url } = queryEndpoints.getAdminEvents(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<OrganizerEventsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): OrganizerEventsPage => ({ rows: res.data.data.events, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};
