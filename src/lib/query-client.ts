import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { ApiErrorResponse } from "./api-types";

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    if (status === 401) return false;
  }

  return failureCount < 2;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
