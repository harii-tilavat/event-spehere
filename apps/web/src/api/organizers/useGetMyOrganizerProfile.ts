import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { OrganizerProfileResponse } from "./types";

export const useGetMyOrganizerProfile = (enabled = true) => {
  const { queryKey, url } = queryEndpoints.getMyOrganizerProfile();
  return useQuery({
    queryKey,
    queryFn: () => getCall<OrganizerProfileResponse>(url),
    select: (res) => res.data.data.organizer,
    enabled,
  });
};
