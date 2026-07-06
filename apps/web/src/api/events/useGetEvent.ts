import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { EventDetailResponse } from "./types";

export const useGetEvent = (slug: string | undefined) => {
  const { queryKey, url } = queryEndpoints.getEvent(slug);
  return useQuery({
    queryKey,
    queryFn: () => getCall<EventDetailResponse>(url),
    select: (res) => res.data.data.event,
    enabled: !!slug,
  });
};
