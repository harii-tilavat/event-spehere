# React Query — architecture & conventions

> Status: foundation landed in **DV-4940** (sub-ticket of **DV-4697**, "Migrate Server State to React Query"). This doc is the pattern every new server-state hook follows.

## TL;DR

- **All server access goes through an `@src/api/<resource>` hook.** Never call `axiosApi` / `useGetData` / `useMutateData` directly from a component or feature.
- **Two layers:** the **data layer** (`src/api/<resource>/`) is organized by API _resource_; the **feature layer** (`src/modules/<feature>/`) is organized by UI and _composes_ data-layer hooks.
- **Query keys are only ever built with `buildKey(...)`** from `src/api/core/queryKeys.ts`. Params go through `normalizeParams(...)` first.
- **Invalidation is declarative** — a mutation's endpoint declares `invalidateKeys`; `useQueryHandlers` fires them. Hooks never call `queryClient.invalidateQueries` directly.

## Why a centralized data layer (not co-located per feature)

This app is not cleanly module-wise — the same API (e.g. `image_batch`) is consumed by multiple features (the upload flow _and_ ImageManagement). If a hook lived inside one feature module, others would have to reach into its internals or duplicate it. Organizing by **resource** gives every API exactly one home, importable anywhere.

| Layer | Location | Owns | Organized by |
|-------|----------|------|--------------|
| Data layer | `src/api/<resource>/` | endpoints, query/mutation hooks, request/response types | **API resource** |
| Feature layer | `src/modules/<feature>/` | `Feature.tsx` (UI) + `useFeature.ts` (composes data-layer hooks + UI state) | **UI feature** |

## Folder shape

```
src/api/
  core/            # shared infra (one-time)
    http.ts            # typed get/post/put/patch/deleteCall around the existing axiosApi
    queryClient.ts     # QueryClient + global mutation-error toast
    queryKeys.ts       # buildKey / normalizeParams  ← only way to build a key
    queryErrors.ts     # getErrorMessage / showErrorToast
    apiTypes.ts        # QueryEndpoint, MutationEndpoint, ApiResponse, ...
    useQueryHandlers.ts# declarative invalidation + onError passthrough
    index.ts           # barrel for core
  <resource>/      # e.g. projectBatch
    paths.ts           # <resource>Paths: URL path builders for endpoints.ts
    endpoints.ts       # queryEndpoints + mutationEndpoints
    types.ts           # request/response types for THIS resource
    use[Get].ts        # one query hook per file
    use[Mutate].ts     # one mutation hook per file
    index.ts           # public barrel
  index.ts         # root barrel — re-exports core + every resource
```

**Imports:**
- **Features / components** import from the single surface `@src/api`.
- **Resource data-layer files** (a resource's `endpoints.ts` / hooks) import core helpers from **`@src/api/core`**, not the root `@src/api`. Going through the root barrel would make the resource part of a `@src/api → resource → @src/api` cycle; importing `@src/api/core` directly sidesteps it. Resource-local files use relative `./paths`, `./endpoints`, and `./types`.
- `src/api/index.ts` still re-exports `./core` first as defense, but no module should depend on that ordering being load-bearing.

The HTTP client (`src/service/api.js`) and its interceptors/token-refresh are **reused untouched** — `core/http.ts` only adds typed wrappers.

## Path functions

Keep URL path construction in a resource-local `paths.ts`. These are **paths**, not full URLs: they are relative to `VITE_API_API_URL`.

Export one object named `<resource>Paths`, and access every path through that object from `endpoints.ts`. Use concise method names because the object already names the resource:

```ts
export const projectBatchPaths = {
  list: () => '/project/batches/',
  detail: (batchId: number) => `/project/batch/${batchId}/`,
  checkName: () => '/project/batch/check-name/',
  create: () => '/project/batch/create/',
  delete: (batchId: number) => `/project/batch/${batchId}/`,
  update: (batchId: number) => `/project/batch/${batchId}/`,
} as const;
```

Preferred names:

- Collection endpoints: `list`, `count`, `create`
- Item endpoints: `detail`, `update`, `delete`
- Custom actions: the action name, e.g. `markRead`, `markSeen`, `markAllRead`, `dismiss`, `snooze`, `checkName`

Avoid repeating the resource name inside each function (`notificationPaths.dismiss(...)`, not `notificationPaths.dismissNotification(...)`).

## Query keys

Shape: **`[resource, entity, id?, subresource?, normalizedParams?]`** — always via `buildKey`.

```ts
buildKey('projectBatch', 'list', normalizeParams(params)); // ['projectBatch','list','page:1|page_size:20']
buildKey('projectBatch', 'detail', id);                    // ['projectBatch','detail', 42]
```

`normalizeParams` sorts keys (and array values) and serializes to a string, so `{ a, b }` and `{ b, a }` resolve to the **same** cache entry. Never embed a raw object in a key — object identity changes every render and breaks caching.

`invalidateKeys` use a **prefix** (e.g. `['projectBatch','list']`) so they invalidate every param variant of that list at once (React Query matches partial keys by default).

**Source `invalidateKeys` from `queryEndpoints`, never rebuild them.** A mutation references the query it affects so the key stays single-sourced — if the query key changes, invalidation follows automatically:

```ts
import { projectBatchPaths } from './paths';

export const mutationEndpoints = {
  createBatch: (): MutationEndpoint => ({
    mutationKey: buildKey('projectBatch', 'create'),
    url: projectBatchPaths.create(),
    invalidateKeys: [queryEndpoints.getBatchList().queryKey], // ← not buildKey(...) again
  }),
  updateBatch: (batchId: number): MutationEndpoint => ({
    mutationKey: buildKey('projectBatch', 'update'),
    url: projectBatchPaths.update(batchId),
    invalidateKeys: [
      queryEndpoints.getBatchList().queryKey,
      queryEndpoints.getBatch(batchId).queryKey,
    ],
  }),
};
```

This is exactly why list query endpoints take **optional** params: calling `queryEndpoints.getBatchList()` with no args yields the clean prefix `['projectBatch','list']` (the nullish params segment is dropped by `buildKey`), which prefix-matches every cached param variant.

## Query hook recipe

> The `projectBatch` / `useGetBatchList` names below show the shape every resource hook follows.

```ts
import { getCall } from '@src/api/core';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryEndpoints } from './endpoints';
import type { BatchListResponse, GetBatchListParams } from './types';

export const useGetBatchList = (
  params: GetBatchListParams
): UseQueryResult<BatchListResponse['result'], Error> => {
  const { queryKey, url } = queryEndpoints.getBatchList(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<BatchListResponse>(url, params),
    select: (response) => response.data.result,
    enabled: params.project_id != null,
  });
};
```

- The `getCall<T>` generic is the **raw** response type; `select` unwraps it to what the UI wants.
- Each resource types its own response — there is **no** single global envelope (divasai endpoints vary).
- Use `enabled` to defer a query until its inputs exist (a `project_id`, a selected id, …).

## Mutation hook recipe

```ts
import { type MutationConfig, postCall, useQueryHandlers } from '@src/api/core';
import { useMutation } from '@tanstack/react-query';

import { mutationEndpoints } from './endpoints';
import type { CreateBatchPayload, CreateBatchResponse } from './types';

export const useCreateBatch = (
  options: MutationConfig<CreateBatchResponse, CreateBatchPayload> = {}
) => {
  const { mutationKey, url, invalidateKeys } = mutationEndpoints.createBatch();
  const { onSuccess, onError } = useQueryHandlers<CreateBatchResponse, CreateBatchPayload>({
    invalidateKeys,
    options,
  });

  return useMutation({
    ...options,
    mutationKey,
    mutationFn: (body) => postCall<CreateBatchResponse>(url, body),
    onSuccess,
    onError,
  });
};
```

Consumers pass React Query options **directly** (flat), not wrapped in a bag:

```ts
const { mutate } = useCreateBatch({ onSuccess: () => closeDialog() });
```

- Mutations accept RQ options directly via `MutationConfig` (an alias for `UseMutationOptions`). `...options` is spread into `useMutation`, so any option passes through (`onMutate`, `retry`, …); the hook always owns `mutationKey`/`mutationFn` and composes `onSuccess` (invalidation first) / `onError`.
- **Error handling:** if a consumer passes `onError`, theirs runs. If not, the global `MutationCache.onError` in `queryClient.ts` shows a toast (it skips errors the axios interceptor already handles — non-Axios rejections and statuses 401/410/429). `useQueryHandlers` only wires `onError` when the consumer supplied one — that's what lets the global handler fire.
- **Invalidation is fire-and-forget:** `useQueryHandlers.onSuccess` triggers `invalidateQueries` but does **not** await it, so the mutation settles before the refetch completes. That's the right default; if a flow needs the list fresh synchronously after `await mutateAsync(...)`, await the invalidation explicitly in that consumer.

## Error & loading state

Mirror the reference repo: **don't add per-view error UI by default.** Three layers cover it, in order of preference:

1. **Route boundary (the default).** The data router's `errorElement: <RouteError />` (`src/routes/AppRoutes/appRouter.tsx`) shows a full-page fallback when a route render/loader throws. React Query also retries (`retry: 1`) and refetches on mount/reconnect, so transient query failures self-heal — most views need **no** error code.
2. **Mutations** toast globally via `MutationCache.onError`; override per call by passing `onError` directly to the hook.
3. **Inline query error — selective only.** Use `QueryError` *only* on a **primary** data view where a failed load would otherwise look like "no data" (a main list/detail). Pass the destructured `error` + `refetch`. Don't use it for secondary widgets — let those stay empty and rely on retry/the boundary.

  ```tsx
  import QueryError from '@src/components/common/QueryError/QueryError';

  const { data, isLoading, isError, error, refetch } = useGetBatchList({ project_id: projectId });
  if (isLoading) return <Loader />;
  if (isError) return <QueryError error={error} onRetry={refetch} />;
  return <BatchList batches={data.results ?? []} />;
  ```

  Reference usage: `BatchManagementView` / `SingleBatchView`. The error→`{ statusCode, msg }` mapping lives in `QueryError`'s sibling hook `useQueryError` (presentation/logic split), so views never map errors themselves.

## Optimistic updates (when needed)

Pass `optimistic` to `useQueryHandlers` — an array of `optimisticTarget(queryKey, patcher)`. On mutate it cancels in-flight queries, snapshots each matching cache, and applies the patcher; on error it rolls every snapshot back; `invalidateKeys` reconciles with the server on success. Keep the cache-patch helpers in the resource's `cache.ts` so multiple mutations reuse them.

```ts
import { optimisticTarget, useQueryHandlers } from '@src/api/core';

import { patchNotificationsReadState } from './cache'; // pure (data, variables) => data
import { mutationEndpoints, queryEndpoints } from './endpoints';

const { mutationKey, url, invalidateKeys } = mutationEndpoints.markRead();
const { onMutate, onSuccess, onError } = useQueryHandlers<NotificationActionResponse, MarkReadVariables>({
  invalidateKeys,
  optimistic: [
    optimisticTarget<NotificationCacheList, MarkReadVariables>(
      queryEndpoints.getNotifications().queryKey,
      patchNotificationsReadState,
    ),
  ],
  options,
});
return useMutation({ ...options, mutationKey, mutationFn: (body) => patchCall(url, body), onMutate, onSuccess, onError });
```

`useQueryHandlers` returns `onMutate` only when `optimistic` is supplied, and composes a single `onError` (rollback → consumer's `onError`); without it, the hook behaves exactly as a normal mutation (`{ onSuccess, onError }`). The patcher must be pure and reference-preserving — return the same page object when nothing on it changed, so untouched rows don't re-render. Reference: `useMarkNotificationsRead` + `notifications/cache.ts`.

With `optimistic` targets, the mutation context **is** the cache snapshot — a consumer's own `onMutate` still runs, but its return value is not used as the `onError`/`onSuccess` context (only the snapshot is). Don't rely on custom `onMutate` context alongside optimistic targets.

## Provider

`QueryClientProvider` wraps the router in `src/main.tsx`, inside `PersistGate`. `ReactQueryDevtools` is mounted in dev only.

## Adding a resource

To add a resource:

1. Create `src/api/<resource>/` with `paths.ts`, `endpoints.ts`, `types.ts`, `useGet*.ts` / `useMutate*.ts`, and an `index.ts` barrel — following the recipes above. Resource files import core via `@src/api/core`.
2. Add `export * from './<resource>';` to `src/api/index.ts`.
3. Consume it from a feature's `useFeature.ts` via `import { useGet... } from '@src/api'`.

Split a resource into `queries/` + `mutations/` subfolders only once it exceeds ~10 hooks.
