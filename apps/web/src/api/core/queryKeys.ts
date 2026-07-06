/**
 * Query keys — shape: [resource, entity, id?, subresource?, normalizedParams?].
 * Only ever build keys with buildKey(); params go through normalizeParams() first
 * (docs/react-query.md). buildKey drops nullish segments, so a paramless call
 * yields a clean prefix that invalidates every param variant of a list.
 */

export type QueryKey = readonly (string | number)[];

export function normalizeParams(params?: Record<string, unknown>): string | undefined {
  if (!params) return undefined;
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${Array.isArray(v) ? [...v].sort().join(",") : String(v)}`);
  return entries.length ? entries.join("|") : undefined;
}

export function buildKey(...parts: (string | number | undefined | null)[]): QueryKey {
  return parts.filter((p): p is string | number => p !== undefined && p !== null);
}
