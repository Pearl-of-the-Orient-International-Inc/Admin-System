import { genUploader } from "uploadthing/client";
import { API_BASE_URL } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";
import type { UploadedEventThumbnail } from "./event.types";

const EVENT_THUMBNAIL_UPLOAD_URL = `${API_BASE_URL}/events/thumbnail/upload`;
const { uploadFiles } = genUploader({
  url: EVENT_THUMBNAIL_UPLOAD_URL,
});

export async function uploadEventThumbnail(
  file: File,
): Promise<UploadedEventThumbnail | undefined> {
  const token = authStore.getAccessToken();

  const uploaded = await uploadFiles("eventThumbnailUploader", {
    files: [file],
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return uploaded?.[0] as UploadedEventThumbnail | undefined;
}
