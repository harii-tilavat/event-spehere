import { useMutation, useQuery } from "@tanstack/react-query";
import { getCall, postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import type { ApiSuccess } from "@eventsphere/shared";
import { mutationEndpoints, queryEndpoints } from "./endpoints";
import type { CheckInResponse, CheckInResultDto, ManualCheckInLookupDto, ManualCheckInResponse } from "./types";

export interface AttendanceStatsDto {
  totalTickets: number;
  checkedIn: number;
  cancelled: number;
  rate: number;
  recent: { ticketCode: string; attendeeName: string; ticketTypeName: string; checkedInAt: string }[];
}

export const useGetAttendance = (eventId: number | undefined) => {
  const { queryKey, url } = queryEndpoints.getAttendance(eventId);
  return useQuery({
    queryKey,
    queryFn: () => getCall<ApiSuccess<AttendanceStatsDto>>(url),
    select: (res) => res.data.data,
    enabled: !!eventId,
    refetchInterval: 15_000,
  });
};

export const useCheckIn = (options: MutationConfig<CheckInResultDto, string> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.checkIn();
  const { onSuccess, onError } = useQueryHandlers<CheckInResultDto, string>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (qrPayload) => (await postCall<CheckInResponse>(url!, { qrPayload })).data.data,
    onSuccess,
    onError,
  });
};

export const useManualLookup = (options: MutationConfig<ManualCheckInLookupDto, string> = {}) => {
  const { mutationKey, url } = mutationEndpoints.manualLookup();
  const { onSuccess, onError } = useQueryHandlers<ManualCheckInLookupDto, string>({ options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (bookingNumber) => (await postCall<ManualCheckInResponse>(url!, { bookingNumber })).data.data,
    onSuccess,
    onError,
  });
};

export const useManualCheckIn = (options: MutationConfig<CheckInResultDto, string> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.manualCheckIn();
  const { onSuccess, onError } = useQueryHandlers<CheckInResultDto, string>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (ticketCode) => (await postCall<CheckInResponse>(url!, { ticketCode })).data.data,
    onSuccess,
    onError,
  });
};
