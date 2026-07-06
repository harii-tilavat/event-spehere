import { buildKey, type MutationEndpoint, type QueryEndpoint } from "@/api/core";
import { ticketTypePaths } from "./paths";

export const queryEndpoints = {
  getTicketTypes: (eventId?: number): QueryEndpoint => ({
    url: ticketTypePaths.listForEvent(eventId ?? 0),
    queryKey: buildKey("ticketTypes", "list", eventId),
  }),
};

/** Ticket changes affect availability everywhere events render. */
const invalidateKeys = () => [queryEndpoints.getTicketTypes().queryKey, buildKey("events"), buildKey("organizerEvents")];

export const mutationEndpoints = {
  createTicketType: (): MutationEndpoint => ({
    mutationKey: buildKey("ticketTypes", "create"),
    invalidateKeys: invalidateKeys(),
  }),
  updateTicketType: (): MutationEndpoint => ({
    mutationKey: buildKey("ticketTypes", "update"),
    invalidateKeys: invalidateKeys(),
  }),
  deleteTicketType: (): MutationEndpoint => ({
    mutationKey: buildKey("ticketTypes", "delete"),
    invalidateKeys: invalidateKeys(),
  }),
};
