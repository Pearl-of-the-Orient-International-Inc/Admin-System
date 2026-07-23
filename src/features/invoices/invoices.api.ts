import { api } from "@/lib/http-client";
import type {
  InvoicePayload,
  InvoiceQueryParams,
  InvoiceResponse,
  InvoicesResponse,
  InvoiceStatus,
} from "./invoices.types";

const basePath = "/accounting/invoices";

export async function getInvoices(params?: InvoiceQueryParams) {
  const { data } = await api.get<InvoicesResponse>(basePath, { params });
  return data;
}

export async function createInvoice(payload: InvoicePayload) {
  const { data } = await api.post<InvoiceResponse>(basePath, payload);
  return data;
}

export async function updateInvoiceStatus({
  id,
  status,
}: {
  id: string;
  status: InvoiceStatus;
}) {
  const { data } = await api.patch<InvoiceResponse>(
    `${basePath}/${encodeURIComponent(id)}/status`,
    { status },
  );
  return data;
}

export async function deleteInvoice(id: string) {
  const { data } = await api.delete<{ code: string; message: string }>(
    `${basePath}/${encodeURIComponent(id)}`,
  );
  return data;
}
