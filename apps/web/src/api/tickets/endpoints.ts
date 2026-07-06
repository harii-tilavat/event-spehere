import { buildKey, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { ticketPaths } from "./paths";

export const queryEndpoints = {
  getAttendance: (eventId?: number): QueryEndpoint => ({
    url: `/events/${eventId ?? 0}/attendance`,
    queryKey: buildKey("attendance", "event", eventId),
  }),
};

const attendanceKeys = () => [queryEndpoints.getAttendance().queryKey, buildKey("bookings")];

export const mutationEndpoints = {
  checkIn: (): MutationEndpoint => ({
    mutationKey: buildKey("tickets", "checkIn"),
    url: ticketPaths.checkIn(),
    invalidateKeys: attendanceKeys(),
  }),
  manualLookup: (): MutationEndpoint => ({
    mutationKey: buildKey("tickets", "manualLookup"),
    url: ticketPaths.manualCheckIn(),
  }),
  manualCheckIn: (): MutationEndpoint => ({
    mutationKey: buildKey("tickets", "manualCheckIn"),
    url: `${ticketPaths.manualCheckIn()}/ticket`,
    invalidateKeys: attendanceKeys(),
  }),
};
