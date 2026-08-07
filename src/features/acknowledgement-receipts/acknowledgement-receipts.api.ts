import { api } from "@/lib/http-client";
import type {
  AcknowledgementReceiptPayload,
  AcknowledgementReceiptQueryParams,
  AcknowledgementReceiptResponse,
  AcknowledgementReceiptsResponse,
} from "./acknowledgement-receipts.types";

const basePath = "/accounting/acknowledgement-receipts";

export async function getAcknowledgementReceipts(
  params?: AcknowledgementReceiptQueryParams,
) {
  const { data } = await api.get<AcknowledgementReceiptsResponse>(basePath, {
    params,
  });
  return data;
}

export async function createAcknowledgementReceipt(
  payload: AcknowledgementReceiptPayload,
) {
  const { data } = await api.post<AcknowledgementReceiptResponse>(
    basePath,
    payload,
  );
  return data;
}

export async function deleteAcknowledgementReceipt(id: string) {
  const { data } = await api.delete<{ code: string; message: string }>(
    `${basePath}/${encodeURIComponent(id)}`,
  );
  return data;
}
