import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { TicketTypesResponse } from "./types";

export const useGetTicketTypes = (eventId: number | undefined) => {
  const { queryKey, url } = queryEndpoints.getTicketTypes(eventId);
  return useQuery({
    queryKey,
    queryFn: () => getCall<TicketTypesResponse>(url),
    select: (res) => res.data.data.ticketTypes,
    enabled: !!eventId,
  });
};
