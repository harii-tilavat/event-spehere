import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiError, ApiSuccess, AuthData, Meta } from "@eventsphere/shared";
import { emitSessionChange, getAccessToken, setAccessToken } from "@/lib/auth-token.js";

const baseURL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Single-flight refresh (docs/05 §2): concurrent 401s share one /auth/refresh call. */
let refreshPromise: Promise<string> | null = null;

export async function refreshSession(): Promise<AuthData> {
  const res = await axios.post<ApiSuccess<AuthData>>(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
  const data = res.data.data;
  setAccessToken(data.accessToken);
  emitSessionChange(data.user);
  return data;
}

function refreshAccessToken(): Promise<string> {
  refreshPromise ??= refreshSession()
    .then((d) => d.accessToken)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const body = error.response?.data as ApiError | undefined;
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && body?.code === "TOKEN_EXPIRED" && original && !original._retried) {
      original._retried = true;
      try {
        const token = await refreshAccessToken();
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      } catch {
        setAccessToken(null);
        emitSessionChange(null);
      }
    }

    // Surface the API error envelope (typed, user-facing message) when present
    return Promise.reject(body && body.success === false ? body : error);
  },
);

export function isApiError(err: unknown): err is ApiError {
  return typeof err === "object" && err !== null && (err as ApiError).success === false;
}

export function errorMessage(err: unknown): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

// Envelope-unwrapping helpers
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiSuccess<T>>(url, { params });
  return res.data.data;
}

export async function getWithMeta<T>(url: string, params?: Record<string, unknown>): Promise<{ data: T; meta?: Meta }> {
  const res = await api.get<ApiSuccess<T>>(url, { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiSuccess<T>>(url, body);
  return res.data.data;
}

export async function postWithMessage<T>(url: string, body?: unknown): Promise<{ data: T; message: string }> {
  const res = await api.post<ApiSuccess<T>>(url, body);
  return { data: res.data.data, message: res.data.message };
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<ApiSuccess<T>>(url, body);
  return res.data.data;
}

export async function del(url: string): Promise<void> {
  await api.delete(url);
}
