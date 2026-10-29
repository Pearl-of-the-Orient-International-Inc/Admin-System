import { api } from "@/lib/http-client";
import type {
  CreateMemoAnnouncementRequest,
  MemoAnnouncementEnvelopeResponse,
  MemoAnnouncementListResponse,
  MemoAnnouncementQueryParams,
  MemoRecipientSearchResponse,
  PublishMemoAnnouncementRequest,
  UpdateMemoAnnouncementRequest,
} from "./memo-announcement.types";

export async function getMemoAnnouncements(
  params: MemoAnnouncementQueryParams = {},
) {
  const { data } = await api.get<MemoAnnouncementListResponse>(
    "/memo-announcements",
    { params },
  );

  return {
    items: data.data,
    pagination: data.pagination,
    code: data.code,
    message: data.message,
  };
}

export async function getMemoAnnouncementById(id: string) {
  const { data } = await api.get<MemoAnnouncementEnvelopeResponse>(
    `/memo-announcements/${encodeURIComponent(id)}`,
  );
  return data.data;
}

export async function createMemoAnnouncement(
  payload: CreateMemoAnnouncementRequest,
) {
  const { data } = await api.post<MemoAnnouncementEnvelopeResponse>(
    "/memo-announcements",
    payload,
  );
  return data.data;
}

export async function updateMemoAnnouncementById({
  id,
  payload,
}: {
  id: string;
  payload: UpdateMemoAnnouncementRequest;
}) {
  const { data } = await api.put<MemoAnnouncementEnvelopeResponse>(
    `/memo-announcements/${encodeURIComponent(id)}`,
    payload,
  );
  return data.data;
}

export async function publishMemoAnnouncement({
  id,
  ...payload
}: PublishMemoAnnouncementRequest) {
  const { data } = await api.post<MemoAnnouncementEnvelopeResponse>(
    `/memo-announcements/${encodeURIComponent(id)}/publish`,
    payload,
  );
  return data.data;
}

export async function deleteMemoAnnouncementById(id: string) {
  await api.delete(`/memo-announcements/${encodeURIComponent(id)}`);
}

export async function archiveMemoAnnouncementById(id: string) {
  const { data } = await api.patch<MemoAnnouncementEnvelopeResponse>(
    `/memo-announcements/${encodeURIComponent(id)}/archive`,
  );
  return data.data;
}

export async function restoreMemoAnnouncementById(id: string) {
  const { data } = await api.patch<MemoAnnouncementEnvelopeResponse>(
    `/memo-announcements/${encodeURIComponent(id)}/restore`,
  );
  return data.data;
}

export async function rejectMemoAnnouncementById({
  id,
  reviewNotes,
}: {
  id: string;
  reviewNotes?: string;
}) {
  const { data } = await api.post<MemoAnnouncementEnvelopeResponse>(
    `/memo-announcements/${encodeURIComponent(id)}/reject`,
    { reviewNotes },
  );
  return data.data;
}

export async function searchMemoRecipients(search: string) {
  const { data } = await api.get<MemoRecipientSearchResponse>(
    "/memo-announcements/recipients/search",
    {
      params: {
        search: search.trim() || undefined,
        limit: 20,
      },
    },
  );
  return data.data;
}
