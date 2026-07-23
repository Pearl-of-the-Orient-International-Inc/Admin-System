import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStore } from "./auth-store";
import type { ApiErrorResponse, RefreshTokenResponse } from "./api-types";

export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_BASE_URL_DEV
    : process.env.NEXT_PUBLIC_API_BASE_URL_PROD;

if (!API_BASE_URL) {
  throw new Error("API base URL is not configured.");
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

const isRefreshRoute = (url?: string) => (url ?? "").includes("/auth/refresh-token");

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .get<RefreshTokenResponse>(`${API_BASE_URL}/auth/refresh-token`, {
        withCredentials: true,
      })
      .then((res) => {
        const token = res.data.accessToken;
        authStore.setAccessToken(token);
        return token;
      })
      .catch(() => {
        authStore.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // needed for refreshToken cookie
});

api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as RetryConfig | undefined;

    if (!original || original._retry || error.response?.status !== 401 || isRefreshRoute(original.url)) {
      return Promise.reject(error);
    }

    original._retry = true;
    const newToken = await refreshAccessToken();

    if (!newToken) return Promise.reject(error);

    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  }
);

export function toApiError(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (!data) {
      return { code: "UNKNOWN_ERROR", message: error.message };
    }

    const issueMessage = data.errors?.map((issue) => issue.message).join(", ");
    const rawErrorMessage = typeof data.error === "string" ? data.error : undefined;

    return {
      ...data,
      message:
        data.message ||
        issueMessage ||
        rawErrorMessage ||
        error.message ||
        "Request failed",
    };
  }
  return { code: "UNKNOWN_ERROR", message: "Unexpected error" };
}
