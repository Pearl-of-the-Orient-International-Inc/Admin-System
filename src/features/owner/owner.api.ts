import { API_BASE_URL } from "@/lib/http-client";
import type { OwnerAuthResponse, OwnerReportResponse } from "./owner.types";

async function ownerFetch<T>(
  path: string,
  init: RequestInit = {},
  options: { unauthorizedMessage?: string } = {},
) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/owner${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot reach owner access server. Check if backend is running and API URL is correct.",
    );
  }

  const payload = (await response.json().catch(() => null)) as
    (T & { message?: string }) | null;

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(options.unauthorizedMessage || "Owner session expired.");
    }

    throw new Error(payload?.message || "Owner request failed.");
  }

  return payload as T;
}

export function loginOwner(pin: string) {
  return ownerFetch<OwnerAuthResponse>(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({ pin }),
    },
    {
      unauthorizedMessage: "Wrong PIN. Please try again.",
    },
  );
}

export function getOwnerSession() {
  return ownerFetch<OwnerAuthResponse>("/session");
}

export function touchOwnerSession() {
  return ownerFetch<OwnerAuthResponse>("/touch", { method: "POST" });
}

export function logoutOwner() {
  return ownerFetch<OwnerAuthResponse>("/logout", { method: "POST" });
}

export function changeOwnerPin({
  currentPin,
  newPin,
}: {
  currentPin: string;
  newPin: string;
}) {
  return ownerFetch<OwnerAuthResponse>(
    "/change-pin",
    {
      method: "POST",
      body: JSON.stringify({ currentPin, newPin }),
    },
    {
      unauthorizedMessage: "Current PIN is incorrect.",
    },
  );
}

export function getOwnerReport(params: { from: string; to: string }) {
  const query = new URLSearchParams(params);
  return ownerFetch<OwnerReportResponse>(`/report?${query.toString()}`);
}
