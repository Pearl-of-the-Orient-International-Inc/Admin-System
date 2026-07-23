import { api } from "@/lib/http-client";
import type {
  AccountingPayablePayload,
  AccountingPayableQueryParams,
  AccountingPayableResponse,
  AccountingPayablesResponse,
  AccountingPayableStatus,
} from "./accounts-payable.types";

const basePath = "/accounting/accounts-payable";

export async function getAccountsPayable(params?: AccountingPayableQueryParams) {
  const { data } = await api.get<AccountingPayablesResponse>(basePath, {
    params,
  });

  return data;
}

export async function getAccountPayable(id: string) {
  const { data } = await api.get<AccountingPayableResponse>(
    `${basePath}/${encodeURIComponent(id)}`,
  );

  return data;
}

export async function createAccountPayable(payload: AccountingPayablePayload) {
  const { data } = await api.post<AccountingPayableResponse>(basePath, payload);

  return data;
}

export async function updateAccountPayable({
  id,
  payload,
}: {
  id: string;
  payload: AccountingPayablePayload;
}) {
  const { data } = await api.put<AccountingPayableResponse>(
    `${basePath}/${encodeURIComponent(id)}`,
    payload,
  );

  return data;
}

export async function updateAccountPayableStatus({
  id,
  status,
}: {
  id: string;
  status: AccountingPayableStatus;
}) {
  const { data } = await api.patch<AccountingPayableResponse>(
    `${basePath}/${encodeURIComponent(id)}/status`,
    { status },
  );

  return data;
}

export async function recordAccountPayablePayment({
  amount,
  id,
}: {
  amount: number;
  id: string;
}) {
  const { data } = await api.post<AccountingPayableResponse>(
    `${basePath}/${encodeURIComponent(id)}/payments`,
    { amount },
  );

  return data;
}

export async function deleteAccountPayable(id: string) {
  const { data } = await api.delete<{ code: string; message: string }>(
    `${basePath}/${encodeURIComponent(id)}`,
  );

  return data;
}
