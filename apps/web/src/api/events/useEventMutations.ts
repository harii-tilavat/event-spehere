import { useMutation } from "@tanstack/react-query";
import { deleteCall, postCall, patchCall, useQueryHandlers, type MutationConfig } from "@/api/core";
import { eventPaths } from "./paths";
import { mutationEndpoints } from "./endpoints";
import type {
  EventDetailDto,
  EventDetailResponse,
  EventPayload,
  RejectEventVariables,
  UpdateEventVariables,
} from "./types";

export const useCreateEvent = (options: MutationConfig<EventDetailDto, EventPayload> = {}) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.createEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, EventPayload>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (body) => (await postCall<EventDetailResponse>(url!, body)).data.data.event,
    onSuccess,
    onError,
  });
};

export const useUpdateEvent = (options: MutationConfig<EventDetailDto, UpdateEventVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.updateEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, UpdateEventVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, data }) => (await patchCall<EventDetailResponse>(eventPaths.update(id), data)).data.data.event,
    onSuccess,
    onError,
  });
};

export const useDeleteEvent = (options: MutationConfig<void, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.deleteEvent();
  const { onSuccess, onError } = useQueryHandlers<void, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => {
      await deleteCall(eventPaths.delete(id));
    },
    onSuccess,
    onError,
  });
};

function lifecycleMutation(path: (id: number) => string) {
  return async (id: number) => (await postCall<EventDetailResponse>(path(id))).data.data.event;
}

export const useSubmitEvent = (options: MutationConfig<EventDetailDto, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.submitEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, number>({ invalidateKeys, options });
  return useMutation({ ...options, mutationKey, mutationFn: lifecycleMutation(eventPaths.submit), onSuccess, onError });
};

export const useCancelEvent = (options: MutationConfig<EventDetailDto, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.cancelEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, number>({ invalidateKeys, options });
  return useMutation({ ...options, mutationKey, mutationFn: lifecycleMutation(eventPaths.cancel), onSuccess, onError });
};

export const useApproveEvent = (options: MutationConfig<EventDetailDto, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.approveEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, number>({ invalidateKeys, options });
  return useMutation({ ...options, mutationKey, mutationFn: lifecycleMutation(eventPaths.approve), onSuccess, onError });
};

export const useRejectEvent = (options: MutationConfig<EventDetailDto, RejectEventVariables> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.rejectEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, RejectEventVariables>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async ({ id, reason }) =>
      (await postCall<EventDetailResponse>(eventPaths.reject(id), { reason })).data.data.event,
    onSuccess,
    onError,
  });
};

export const useToggleFeatureEvent = (options: MutationConfig<EventDetailDto, number> = {}) => {
  const { mutationKey, invalidateKeys } = mutationEndpoints.toggleFeatureEvent();
  const { onSuccess, onError } = useQueryHandlers<EventDetailDto, number>({ invalidateKeys, options });
  return useMutation({
    ...options,
    mutationKey,
    mutationFn: async (id) => (await patchCall<EventDetailResponse>(eventPaths.feature(id))).data.data.event,
    onSuccess,
    onError,
  });
};
