import { api } from "@/lib/http-client";
import type {
  BulletinEntryPayload,
  BulletinEntryQueryParams,
  BulletinEnvelopeResponse,
  BulletinListResponse,
} from "./bulletin.types";

export async function getBulletinEntries(
  params: BulletinEntryQueryParams = {},
) {
  const { data } = await api.get<BulletinListResponse>("/bulletins", {
    params,
  });
  return data;
}

export async function createBulletinEntry(payload: BulletinEntryPayload) {
  const { data } = await api.post<BulletinEnvelopeResponse>(
    "/bulletins",
    payload,
  );
  return data.data;
}

export async function updateBulletinEntry({
  id,
  payload,
}: {
  id: string;
  payload: BulletinEntryPayload;
}) {
  const { data } = await api.put<BulletinEnvelopeResponse>(
    `/bulletins/${encodeURIComponent(id)}`,
    payload,
  );
  return data.data;
}

const updateStatus = async (
  id: string,
  action: "publish" | "unpublish" | "archive" | "restore",
) => {
  const { data } = await api.patch<BulletinEnvelopeResponse>(
    `/bulletins/${encodeURIComponent(id)}/${action}`,
  );
  return data.data;
};

export const publishBulletinEntry = (id: string) => updateStatus(id, "publish");
export const unpublishBulletinEntry = (id: string) =>
  updateStatus(id, "unpublish");
export const archiveBulletinEntry = (id: string) => updateStatus(id, "archive");
export const restoreBulletinEntry = (id: string) => updateStatus(id, "restore");
