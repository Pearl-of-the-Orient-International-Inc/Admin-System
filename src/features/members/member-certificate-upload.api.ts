import { genUploader } from "uploadthing/client";

import { API_BASE_URL } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";
import { refreshToken } from "@/features/auth/auth.api";

const MEMBER_CERTIFICATE_UPLOAD_URL = `${API_BASE_URL}/members/certificates/upload`;

const { uploadFiles } = genUploader({
  url: MEMBER_CERTIFICATE_UPLOAD_URL,
});

type UploadedMemberCertificate = {
  ufsUrl: string;
  url: string;
};

export async function uploadGeneratedMemberCertificate(file: File) {
  let token = authStore.getAccessToken();

  try {
    const session = await refreshToken();
    token = session.accessToken ?? token;
  } catch {
    token = authStore.getAccessToken();
  }

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const uploaded = await uploadFiles("memberCertificateUploader", {
    files: [file],
    headers: { Authorization: `Bearer ${token}` },
  });

  return uploaded?.[0] as UploadedMemberCertificate | undefined;
}
