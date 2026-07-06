import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { EventsPage, EventsResponse, GetEventsParams } from "./types";

export const useGetEvents = (params?: GetEventsParams) => {
  const { queryKey, url } = queryEndpoints.getEvents(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<EventsResponse>(url, params as Record<string, unknown> | undefined),
    select: (res): EventsPage => ({ rows: res.data.data.events, meta: res.data.meta }),
    placeholderData: keepPreviousData,
  });
};
