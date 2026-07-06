import { buildKey, normalizeParams, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { eventPaths } from "./paths";
import type { GetEventsByStatusParams, GetEventsParams } from "./types";

export const queryEndpoints = {
  getEvents: (params?: GetEventsParams): QueryEndpoint => ({
    url: eventPaths.list(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("events", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getEvent: (slug?: string): QueryEndpoint => ({
    url: eventPaths.detail(slug ?? ""),
    queryKey: buildKey("events", "detail", slug),
  }),
  getOrganizerEvents: (params?: GetEventsByStatusParams): QueryEndpoint => ({
    url: eventPaths.organizerList(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("organizerEvents", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
  getAdminEvents: (params?: GetEventsByStatusParams): QueryEndpoint => ({
    url: eventPaths.adminList(),
    params: params as Record<string, unknown> | undefined,
    queryKey: buildKey("adminEvents", "list", normalizeParams(params as Record<string, unknown> | undefined)),
  }),
};

/** Every lifecycle mutation touches all three views + any cached detail (prefix "events"). */
const allEventKeys = () => [
  buildKey("events"),
  queryEndpoints.getOrganizerEvents().queryKey,
  queryEndpoints.getAdminEvents().queryKey,
];

export const mutationEndpoints = {
  createEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "create"),
    url: eventPaths.create(),
    invalidateKeys: allEventKeys(),
  }),
  updateEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "update"),
    invalidateKeys: allEventKeys(),
  }),
  deleteEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "delete"),
    invalidateKeys: allEventKeys(),
  }),
  submitEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "submit"),
    invalidateKeys: allEventKeys(),
  }),
  cancelEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "cancel"),
    invalidateKeys: allEventKeys(),
  }),
  approveEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "approve"),
    invalidateKeys: allEventKeys(),
  }),
  rejectEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "reject"),
    invalidateKeys: allEventKeys(),
  }),
  toggleFeatureEvent: (): MutationEndpoint => ({
    mutationKey: buildKey("events", "feature"),
    invalidateKeys: allEventKeys(),
  }),
};
