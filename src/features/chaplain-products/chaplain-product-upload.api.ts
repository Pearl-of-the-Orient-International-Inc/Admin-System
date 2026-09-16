import { genUploader } from "uploadthing/client";
import { authStore } from "@/lib/auth-store";
import { refreshToken } from "@/features/auth/auth.api";
import { API_BASE_URL } from "@/lib/http-client";
import type { UploadedChaplainProductImage } from "./chaplain-product.types";

const { uploadFiles } = genUploader({
  url: new URL("/api/uploadthing", API_BASE_URL).toString(),
});

export async function uploadChaplainProductImage(file: File) {
  let token = authStore.getAccessToken();

  try {
    const refreshedSession = await refreshToken();
    token = refreshedSession.accessToken ?? token;
  } catch {
    token = authStore.getAccessToken();
  }

  if (!token) throw new Error("Session expired. Please sign in again.");

  const uploaded = await uploadFiles("chaplainProductImageUploader", {
    files: [file],
    headers: { Authorization: `Bearer ${token}` },
  });

  return uploaded?.[0] as UploadedChaplainProductImage | undefined;
}
