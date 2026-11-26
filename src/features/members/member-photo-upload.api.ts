import { genUploader } from "uploadthing/client";

import { API_BASE_URL } from "@/lib/http-client";

const MEMBER_PHOTO_UPLOAD_URL =
  `${API_BASE_URL}/members/application-photo/upload`;

const { uploadFiles } = genUploader({
  url: MEMBER_PHOTO_UPLOAD_URL,
});

type UploadedMemberPhoto = {
  ufsUrl: string;
  url: string;
};

export async function uploadMemberIdPhoto(file: File) {
  const uploaded = await uploadFiles("membershipApplicationPhotoUploader", {
    files: [file],
  });

  return uploaded?.[0] as UploadedMemberPhoto | undefined;
}
