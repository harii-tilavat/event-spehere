# EventSphere — Engineering Conventions

Read this before implementing anything. These rules are binding for all new code and refactors.
Monorepo: `apps/web` (React SPA), `apps/api` (Express), `packages/shared` (types/schemas/enums), `packages/ui` (shared component library).

## Repo adaptations (how the generic rules map to this codebase)

- **Import alias**: this repo uses `@/*` → `<app>/src/*` (the equivalent of `@src/*` in the generic rules). Never use deep relative imports like `../../../foo`.
- **No Redux** — server state lives in TanStack React Query; session/theme in React context. Where the rules mention Redux selectors/dispatches, read "React Query hooks / context".
- **Data layer**: `apps/web/src/api/` — `core/` (axios instance, `buildKey`, `normalizeParams`, `useGetData`, `useMutateData`, `useQueryHandlers`) plus one folder per API resource. See "Data layer" below.
- **Shared UI**: presentation-only primitives and generic composites live in `@eventsphere/ui` (`packages/ui`). App-specific components (routing- or data-coupled) live in the web app under the feature-folder convention.
- **Commits**: one focused commit per completed task, message style `(scope) message` — scopes: `docs`, `root`, `shared`, `ui`, `api`, `web`.
- **Testing**: after each major functionality, verify in the Chrome preview (login, CRUD, flows) and fix bugs before moving on.

## Verification checklist (run mentally on every change)

- Edge cases, `null`/`undefined` handling, async race conditions, stale state.
- No missing `useEffect` / `useMemo` / `useCallback` dependencies.
- No state initialized from props or API data that can go stale after re-fetches.
- Every event listener, timer, subscription, observer, or external resource has cleanup.
- No memory leaks from async effects (guard with cancelled flags / AbortController).

## Error handling

- No silent failures. Every user-facing action surfaces errors (sonner toast using the API envelope message).
- Do not leave `console.error` or `console.log` in frontend code. (Server-side structured logging in `apps/api` is fine.)

## Code quality

- No unused imports, variables, dead code, commented-out code, or debug statements.
- camelCase for all frontend-owned variables, state, props, functions. snake_case only at the API boundary for backend contract fields.
- Keep naming consistent with surrounding code.

## Imports

- Use the `@/*` alias for project imports; barrel files for component groups.
- Run `pnpm --filter web lint --fix` after changing imports.

## UI consistency

- Tailwind CSS only — no custom CSS files, CSS modules, styled-components, inline styles. New stylesheet files require a documented technical reason.
- No conflicting/duplicate Tailwind classes. Reuse existing spacing, button, modal, badge, and form patterns from `@eventsphere/ui` and existing pages before inventing new ones.
- Design tokens are the CSS variables in `apps/web/src/index.css` (shadcn zinc, dark-first).

## Performance

- Avoid unnecessary re-renders and expensive computations in render paths.
- Memoize derived values only when justified by actual render cost.

## Component structure convention

Every new component lives in its own folder:

```txt
Feature/
├── Feature.tsx       # presentation + JSX only; consumes useFeature.ts
├── useFeature.ts     # ALL logic: state, effects, memo, refs, API-hook composition, handlers, derived values; returns a named object
├── types.ts          # ALL component-specific types/interfaces/enums/props — never inline props in Feature.tsx
├── const.ts          # optional, component-specific constants only
└── components/       # child components, same structure, re-exported via components/index.ts barrel
```

- `Feature.tsx` must not contain business logic, API calls, or complex state management.
- `useFeature.ts` composes data-layer hooks from `@/api`; it never fetches directly.
- Child components are imported through the `./components` barrel.
- New React components → `.tsx`; hooks/utilities/services/constants → `.ts`. Never create `.js`/`.jsx`.

**Reject (or fix) any change that**: adds a component without a dedicated folder; defines props inline instead of `types.ts`; puts significant business logic in a `.tsx`; introduces `.js`/`.jsx`; stores component constants outside its `const.ts`.

## Data layer (`apps/web/src/api`)

- All server access goes through an `@/api/<resource>` hook. **Never** call the axios instance, `useGetData`, or `useMutateData` directly from a component or feature.
- Organized **by API resource** (`src/api/categories/`, `src/api/venues/`, …), not by feature — a resource is consumed by many features, so it lives in one place.
- Feature `useFeature.ts` hooks **compose** these data-layer hooks; they never fetch directly.
- Query/mutation keys are built only with `buildKey(...)`; request params go through `normalizeParams(...)`.
- Invalidation is declarative: a mutation endpoint declares `invalidateKeys` **sourced from `queryEndpoints.getX().queryKey`** (never rebuilt by hand), and `useQueryHandlers` fires them. Never call `queryClient.invalidateQueries` inside a feature hook.
- Features/components import from the single surface `@/api`. Resource files import core helpers from `@/api/core` (not the root barrel) to avoid import cycles; resource-local files use relative `./endpoints` / `./types`.

### Resource folder structure

```txt
src/api/<resource>/
├── paths.ts              # <resource>Paths: URL path builders (list/detail/create/update/delete/…)
├── endpoints.ts          # queryEndpoints + mutationEndpoints (URL + keys + invalidateKeys)
├── types.ts              # request/response types for this resource (usually re-exports from @eventsphere/shared)
├── useGet<X>.ts          # one query hook per file
├── use<Mutate><X>.ts     # one mutation hook per file
└── index.ts              # public barrel
```

Add `export * from "./<resource>";` to `src/api/index.ts`. Split into `queries/` + `mutations/` subfolders only when a resource exceeds ~10 hooks.

Error/loading layers (in order): route `errorElement` full-page fallback → global mutation-error toast in `queryClient.ts` (skipped when the consumer passes `onError`) → selective `QueryError` only on primary data views. Mutations accept flat React Query options (`useCreateX({ onSuccess })`).

Copy-paste recipes live in [docs/react-query.md](docs/react-query.md) — follow them when adding a resource. (That doc's `@src/*` alias and `src/modules/` naming map to `@/*` and `src/features/` here.)

## Shared packages

- `@eventsphere/shared`: API envelope types, DTOs, domain enums, Zod schemas — the single source of truth consumed by web AND api. Validation rules change here, nowhere else.
- `@eventsphere/ui`: presentation-only primitives (button, card, badge, input, label, textarea, table, dialog, select, toaster) and generic composites (DataTable, ConfirmDialog, FormField, PageHeader). No axios, no react-router, no app state — anything coupled to data or routing stays in `apps/web`.

## Backend conventions (`apps/api`)

- Layering: routes → controllers (thin) → services (all business rules, transactions, ownership checks) → models. Controllers never import models.
- Validation with shared Zod schemas via `validate()` middleware; errors via `AppError(status, code, message)` → central handler → envelope.
- Every multi-table write is transactional; money in integer paise; timestamps UTC.
