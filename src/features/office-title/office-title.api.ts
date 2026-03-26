import { api } from "@/lib/http-client";
import type {
  CreateOfficeTitleRequest,
  OfficeTitleEnvelopeResponse,
  OfficeTitleListResponse,
  OfficeTitleQueryParams,
  UpdateOfficeTitleRequest,
} from "./office-title.types";

export async function getOfficeTitles(params: OfficeTitleQueryParams = {}) {
  const { data } = await api.get<OfficeTitleListResponse>("/offices", {
    params,
  });

  return {
    items: data.data,
    pagination: data.pagination,
    code: data.code,
    message: data.message,
  };
}

export async function getOfficeTitleById(id: string) {
  const { data } = await api.get<OfficeTitleEnvelopeResponse>(
    `/offices/${encodeURIComponent(id)}`,
  );
  return data.data;
}

export async function createOfficeTitle(payload: CreateOfficeTitleRequest) {
  const { data } = await api.post<OfficeTitleEnvelopeResponse>(
    "/offices/create",
    payload,
  );
  return data.data;
}

export async function updateOfficeTitleById({
  id,
  payload,
}: {
  id: string;
  payload: UpdateOfficeTitleRequest;
}) {
  const { data } = await api.put<OfficeTitleEnvelopeResponse>(
    `/offices/${encodeURIComponent(id)}`,
    payload,
  );
  return data.data;
}

export async function deleteOfficeTitleById(id: string) {
  await api.delete(`/offices/${encodeURIComponent(id)}`);
}

export async function archiveOfficeTitleById(id: string) {
  const { data } = await api.patch<OfficeTitleEnvelopeResponse>(
    `/offices/${encodeURIComponent(id)}/archive`,
  );
  return data.data;
}

export async function retrieveOfficeTitleById(id: string) {
  const { data } = await api.patch<OfficeTitleEnvelopeResponse>(
    `/offices/${encodeURIComponent(id)}/retrieve`,
  );
  return data.data;
}
