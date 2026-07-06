import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "./queryKeys";
import type { MutationConfig } from "./apiTypes";

export interface OptimisticTarget<TVariables> {
  queryKey: QueryKey;
  patch: (data: unknown, variables: TVariables) => unknown;
}

/** Pair a cached query with a pure, reference-preserving patcher (docs/react-query.md). */
export function optimisticTarget<TData, TVariables>(
  queryKey: QueryKey,
  patch: (data: TData, variables: TVariables) => TData,
): OptimisticTarget<TVariables> {
  return { queryKey, patch: patch as (data: unknown, variables: TVariables) => unknown };
}

type Snapshot = { queryKey: QueryKey; data: unknown }[];
type AnyFn = (...args: unknown[]) => unknown;

interface UseQueryHandlersArgs<TData, TVariables, TContext> {
  invalidateKeys?: QueryKey[];
  optimistic?: OptimisticTarget<TVariables>[];
  options: MutationConfig<TData, TVariables, TContext>;
}

/**
 * Declarative invalidation + optional optimistic updates.
 * - onSuccess: fire-and-forget invalidation of the endpoint's invalidateKeys, then the consumer's onSuccess.
 * - onError: wired when the consumer supplied one or optimistic rollback is needed —
 *   otherwise the global MutationCache toast handles it.
 * - onMutate: returned only when optimistic targets are supplied.
 * Consumer callbacks are forwarded all original React Query arguments.
 */
export function useQueryHandlers<TData, TVariables, TContext = unknown>({
  invalidateKeys,
  optimistic,
  options,
}: UseQueryHandlersArgs<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    for (const key of invalidateKeys ?? []) {
      void queryClient.invalidateQueries({ queryKey: key });
    }
  };

  const onMutate = optimistic
    ? async (variables: TVariables, ...rest: unknown[]): Promise<Snapshot> => {
        const snapshot: Snapshot = [];
        for (const target of optimistic) {
          await queryClient.cancelQueries({ queryKey: target.queryKey });
          for (const [queryKey, data] of queryClient.getQueriesData({ queryKey: target.queryKey })) {
            snapshot.push({ queryKey: queryKey as QueryKey, data });
            if (data !== undefined) queryClient.setQueryData(queryKey, target.patch(data, variables));
          }
        }
        await (options.onMutate as AnyFn | undefined)?.(variables, ...rest);
        return snapshot;
      }
    : undefined;

  const onSuccess = (data: TData, variables: TVariables, ...rest: unknown[]) => {
    invalidate();
    (options.onSuccess as AnyFn | undefined)?.(data, variables, ...rest);
  };

  const rollback = (maybeSnapshot: unknown) => {
    if (!Array.isArray(maybeSnapshot)) return;
    for (const { queryKey, data } of maybeSnapshot as Snapshot) {
      queryClient.setQueryData(queryKey, data);
    }
  };

  const onError =
    optimistic || options.onError
      ? (error: unknown, variables: TVariables, ...rest: unknown[]) => {
          if (optimistic) rollback(rest[0]);
          (options.onError as AnyFn | undefined)?.(error, variables, ...rest);
        }
      : undefined;

  return { onMutate, onSuccess, onError };
}
