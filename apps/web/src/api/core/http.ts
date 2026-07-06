import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { ApiError, ApiSuccess, AuthData } from "@eventsphere/shared";
import { emitSessionChange, getAccessToken, setAccessToken } from "./authToken";

const baseURL = import.meta.env.VITE_API_URL as string;

/** Single axios instance — interceptors own auth headers + token refresh (docs/05 §2). */
export const httpClient = axios.create({ baseURL, withCredentials: true });

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Single-flight refresh: concurrent 401s share one /auth/refresh call. */
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

httpClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const body = error.response?.data as ApiError | undefined;
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && body?.code === "TOKEN_EXPIRED" && original && !original._retried) {
      original._retried = true;
      try {
        const token = await refreshAccessToken();
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return httpClient(original);
      } catch {
        setAccessToken(null);
        emitSessionChange(null);
      }
    }

    // Surface the typed API error envelope when present
    return Promise.reject(body && body.success === false ? body : error);
  },
);

// Typed call wrappers — resource hooks use these; components never do.
export function getCall<T>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
  return httpClient.get<T>(url, { params });
}

export function postCall<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return httpClient.post<T>(url, body, config);
}

export function patchCall<T>(url: string, body?: unknown): Promise<AxiosResponse<T>> {
  return httpClient.patch<T>(url, body);
}

export function putCall<T>(url: string, body?: unknown): Promise<AxiosResponse<T>> {
  return httpClient.put<T>(url, body);
}

export function deleteCall<T = void>(url: string): Promise<AxiosResponse<T>> {
  return httpClient.delete<T>(url);
}
