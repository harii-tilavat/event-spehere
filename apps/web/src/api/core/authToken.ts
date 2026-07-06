import type { UserDto } from "@eventsphere/shared";

/**
 * In-memory access token store (never persisted — docs/08 §1).
 * Lives outside React so the axios interceptors can read it without hooks.
 */
let accessToken: string | null = null;

type SessionListener = (user: UserDto | null) => void;
const listeners = new Set<SessionListener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function onSessionChange(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Called by the http layer after a background refresh succeeds/fails. */
export function emitSessionChange(user: UserDto | null): void {
  for (const l of listeners) l(user);
}
