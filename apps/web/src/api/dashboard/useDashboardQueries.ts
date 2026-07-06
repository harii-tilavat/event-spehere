import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type {
  AdminDashboardResponse,
  AttendeeDashboardResponse,
  DashboardRange,
  OrganizerDashboardResponse,
} from "./types";

export const useGetAdminDashboard = (range: DashboardRange, enabled = true) => {
  const { queryKey, url } = queryEndpoints.getAdminDashboard(range);
  return useQuery({
    queryKey,
    queryFn: () => getCall<AdminDashboardResponse>(url, { range }),
    select: (res) => res.data.data,
    enabled,
    staleTime: 30_000,
  });
};

export const useGetOrganizerDashboard = (range: DashboardRange, enabled = true) => {
  const { queryKey, url } = queryEndpoints.getOrganizerDashboard(range);
  return useQuery({
    queryKey,
    queryFn: () => getCall<OrganizerDashboardResponse>(url, { range }),
    select: (res) => res.data.data,
    enabled,
    staleTime: 30_000,
  });
};

export const useGetAttendeeDashboard = (enabled = true) => {
  const { queryKey, url } = queryEndpoints.getAttendeeDashboard();
  return useQuery({
    queryKey,
    queryFn: () => getCall<AttendeeDashboardResponse>(url),
    select: (res) => res.data.data,
    enabled,
    staleTime: 30_000,
  });
};
