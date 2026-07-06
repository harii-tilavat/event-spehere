import { useMutation } from "@tanstack/react-query";
import { deleteCall, patchCall, postCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { ticketTypePaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type { CreateTicketTypeVariables, TicketTypeDto, TicketTypeResponse, UpdateTicketTypeVariables } from "./types";

export const useCreateTicketType = (options: MutationConfig<TicketTypeDto, CreateTicketTypeVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.createTicketType();
  const { onSuccess, onError } = useQueryHandlers<TicketTypeDto, CreateTicketTypeVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ eventId, data }) =>
      (await postCall<TicketTypeResponse>(ticketTypePaths.create(eventId), data)).data.data.ticketType,
    onSuccess,
    onError,
  });
};

export const useUpdateTicketType = (options: MutationConfig<TicketTypeDto, UpdateTicketTypeVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.updateTicketType();
  const { onSuccess, onError } = useQueryHandlers<TicketTypeDto, UpdateTicketTypeVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, data }) =>
      (await patchCall<TicketTypeResponse>(ticketTypePaths.update(id), data)).data.data.ticketType,
    onSuccess,
    onError,
  });
};

export const useDeleteTicketType = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.deleteTicketType();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await deleteCall(ticketTypePaths.delete(id));
    },
    onSuccess,
    onError,
  });
};
