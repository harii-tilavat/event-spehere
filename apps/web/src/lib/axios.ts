import axios from "axios";
import type { ApiError, ApiSuccess } from "@eventsphere/shared";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Phase 1 wires interceptors here (docs/05 §2):
// - request: attach in-memory access token as Authorization: Bearer
// - response: on 401 TOKEN_EXPIRED, queue requests, POST /auth/refresh once, replay

/** Unwrap the API envelope; throws the ApiError body for React Query to surface. */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiSuccess<T>>(url, { params });
  return res.data.data;
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === "object" && err !== null && (err as ApiError).success === false;
}
