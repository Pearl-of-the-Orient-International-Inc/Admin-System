import { api } from "@/lib/http-client";
import type {
  AccountingReceivablePayload,
  AccountingReceivableQueryParams,
  AccountingReceivableResponse,
  AccountingReceivablesResponse,
  AccountingReceivableStatus,
} from "./accounts-receivable.types";

const basePath = "/accounting/accounts-receivable";

export async function getAccountsReceivable(params?: AccountingReceivableQueryParams) {
  const { data } = await api.get<AccountingReceivablesResponse>(basePath, { params });
  return data;
}

export async function getAccountReceivable(id: string) {
  const { data } = await api.get<AccountingReceivableResponse>(`${basePath}/${encodeURIComponent(id)}`);
  return data;
}

export async function createAccountReceivable(payload: AccountingReceivablePayload) {
  const { data } = await api.post<AccountingReceivableResponse>(basePath, payload);
  return data;
}

export async function updateAccountReceivable({ id, payload }: { id: string; payload: AccountingReceivablePayload }) {
  const { data } = await api.put<AccountingReceivableResponse>(`${basePath}/${encodeURIComponent(id)}`, payload);
  return data;
}

export async function updateAccountReceivableStatus({ id, status }: { id: string; status: AccountingReceivableStatus }) {
  const { data } = await api.patch<AccountingReceivableResponse>(`${basePath}/${encodeURIComponent(id)}/status`, { status });
  return data;
}

export async function recordAccountReceivablePayment({ amount, id }: { amount: number; id: string }) {
  const { data } = await api.post<AccountingReceivableResponse>(`${basePath}/${encodeURIComponent(id)}/payments`, { amount });
  return data;
}

export async function deleteAccountReceivable(id: string) {
  const { data } = await api.delete<{ code: string; message: string }>(`${basePath}/${encodeURIComponent(id)}`);
  return data;
}
