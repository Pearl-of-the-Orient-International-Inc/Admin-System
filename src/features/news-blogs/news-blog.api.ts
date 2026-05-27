import { api } from "@/lib/http-client";
import type {
  CreateNewsBlogRequest,
  NewsBlogEnvelopeResponse,
  NewsBlogListResponse,
  NewsBlogQueryParams,
  NewsBlogRecord,
  UpdateNewsBlogRequest,
} from "./news-blog.types";

function mapNewsBlogRecord(
  resource: NewsBlogEnvelopeResponse["data"],
): NewsBlogRecord {
  return {
    id: resource.id,
    title: resource.title,
    caption: resource.caption,
    isActive: resource.isActive,
    status: resource.status,
    platform: resource.platform,
    media: resource.media.map((item) => ({
      id: item.id,
      kind: item.kind === "IMAGE" ? "image" : "video",
      fileName: item.fileName,
      previewUrl: item.fileUrl,
      file: null,
    })),
    taggedMembers: resource.taggedMembers.map((taggedMember) => ({
      id: taggedMember.member.id,
      fullName: taggedMember.member.fullName,
      email: taggedMember.member.user.email,
      avatar: taggedMember.member.user.avatar,
    })),
    hashtags: resource.hashtags,
    updatedAt: resource.updatedAt,
    createdAt: resource.createdAt,
    scheduledAt: resource.scheduledAt,
    publishedAt: resource.publishedAt,
  };
}

export async function syncNewsBlogToFacebook({
  action,
  newsBlog,
}: {
  action: "create" | "update" | "manual";
  newsBlog: NewsBlogRecord;
}) {
  const response = await fetch("/api/facebook/news-blogs/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      newsBlog,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; postId?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.message || "Unable to publish this update to Facebook.",
    );
  }

  return payload;
}

export async function getNewsBlogs(params: NewsBlogQueryParams = {}) {
  const { data } = await api.get<NewsBlogListResponse>("/news-blogs", {
    params,
  });

  return {
    items: data.data.map(mapNewsBlogRecord),
    pagination: data.pagination,
    code: data.code,
    message: data.message,
  };
}

export async function getNewsBlogById(id: string) {
  const { data } = await api.get<NewsBlogEnvelopeResponse>(
    `/news-blogs/${encodeURIComponent(id)}`,
  );
  return mapNewsBlogRecord(data.data);
}

export async function createNewsBlog(payload: CreateNewsBlogRequest) {
  const { data } = await api.post<NewsBlogEnvelopeResponse>(
    "/news-blogs/create",
    payload,
  );
  return mapNewsBlogRecord(data.data);
}

export async function updateNewsBlogById({
  id,
  payload,
}: {
  id: string;
  payload: UpdateNewsBlogRequest;
}) {
  const { data } = await api.put<NewsBlogEnvelopeResponse>(
    `/news-blogs/${encodeURIComponent(id)}`,
    payload,
  );
  return mapNewsBlogRecord(data.data);
}

export async function deleteNewsBlogById(id: string) {
  await api.delete(`/news-blogs/${encodeURIComponent(id)}`);
}

export async function publishNewsBlogById(id: string) {
  const { data } = await api.patch<NewsBlogEnvelopeResponse>(
    `/news-blogs/${encodeURIComponent(id)}/publish`,
  );
  return mapNewsBlogRecord(data.data);
}

export async function archiveNewsBlogById(id: string) {
  const { data } = await api.patch<NewsBlogEnvelopeResponse>(
    `/news-blogs/${encodeURIComponent(id)}/archive`,
  );
  return mapNewsBlogRecord(data.data);
}

export async function retrieveNewsBlogById(id: string) {
  const { data } = await api.patch<NewsBlogEnvelopeResponse>(
    `/news-blogs/${encodeURIComponent(id)}/retrieve`,
  );
  return mapNewsBlogRecord(data.data);
}
