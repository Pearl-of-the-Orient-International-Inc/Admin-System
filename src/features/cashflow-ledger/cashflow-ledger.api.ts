import { api } from "@/lib/http-client";
import type {
  LedgerQueryParams,
  LedgerTransactionPayload,
  LedgerTransactionResponse,
  LedgerTransactionsResponse,
} from "./cashflow-ledger.types";

const basePath = "/accounting/cashflow-ledger";

export async function getLedgerTransactions(params?: LedgerQueryParams) {
  const { data } = await api.get<LedgerTransactionsResponse>(basePath, { params });
  return data;
}

export async function createLedgerTransaction(payload: LedgerTransactionPayload) {
  const { data } = await api.post<LedgerTransactionResponse>(basePath, payload);
  return data;
}

export async function updateLedgerTransaction({
  id,
  payload,
}: {
  id: string;
  payload: LedgerTransactionPayload;
}) {
  const { data } = await api.put<LedgerTransactionResponse>(
    `${basePath}/${encodeURIComponent(id)}`,
    payload,
  );
  return data;
}

export async function deleteLedgerTransaction(id: string) {
  const { data } = await api.delete<{ code: string; message: string }>(
    `${basePath}/${encodeURIComponent(id)}`,
  );
  return data;
}
