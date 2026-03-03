import { genUploader } from "uploadthing/client";
import { API_BASE_URL } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";

const AVATAR_UPLOAD_URL = `${API_BASE_URL}/users/avatar/upload`;
const { uploadFiles } = genUploader({
  url: AVATAR_UPLOAD_URL,
});

export async function uploadAvatar(file: File) {
  const token = authStore.getAccessToken();

  const uploaded = await uploadFiles("avatarUploader", {
    files: [file],
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return uploaded?.[0];
}
