import type { UseMutationOptions } from "@tanstack/react-query";
import type { QueryKey } from "./queryKeys";

/** Returned by a resource's queryEndpoints.getX(...) factory. */
export interface QueryEndpoint {
  queryKey: QueryKey;
  url: string;
  params?: Record<string, unknown>;
}

/** Returned by a resource's mutationEndpoints.x(...) factory. */
export interface MutationEndpoint {
  mutationKey: QueryKey;
  /** Omitted when the URL depends on mutation variables — the hook builds it from paths. */
  url?: string;
  /** Sourced from queryEndpoints.getX().queryKey — never rebuilt by hand. */
  invalidateKeys?: QueryKey[];
}

/** Flat React Query options passthrough for mutation hooks. */
export type MutationConfig<TData, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, unknown, TVariables, TContext>,
  "mutationKey" | "mutationFn"
>;
