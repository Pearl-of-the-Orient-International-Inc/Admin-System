import { genUploader } from "uploadthing/client";
import { API_BASE_URL } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";
import { refreshToken } from "@/features/auth/auth.api";
import type { UploadedNewsBlogMedia } from "./news-blog.types";

const NEWS_BLOG_MEDIA_UPLOAD_URL = new URL(
  "/api/uploadthing",
  API_BASE_URL,
).toString();
const { uploadFiles } = genUploader({
  url: NEWS_BLOG_MEDIA_UPLOAD_URL,
});

export async function uploadNewsBlogMedia(
  files: File[],
): Promise<UploadedNewsBlogMedia[]> {
  let token = authStore.getAccessToken();

  try {
    const refreshedSession = await refreshToken();
    token = refreshedSession.accessToken ?? token;
  } catch {
    token = authStore.getAccessToken();
  }

  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }

  const uploaded = await uploadFiles("newsBlogMediaUploader", {
    files,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return (uploaded ?? []) as UploadedNewsBlogMedia[];
}
