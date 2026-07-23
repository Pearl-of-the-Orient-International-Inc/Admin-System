import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as accountsReceivableApi from "./accounts-receivable.api";
import type { AccountingReceivableQueryParams } from "./accounts-receivable.types";

const rootKey = ["accounting", "accounts-receivable"] as const;

export const useAccountsReceivableQuery = (params: AccountingReceivableQueryParams = {}) =>
  useQuery({
    queryKey: [...rootKey, "list", params],
    queryFn: () => accountsReceivableApi.getAccountsReceivable(params),
    staleTime: 30_000,
  });

export const useAccountReceivableQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...rootKey, "detail", id],
    queryFn: () => accountsReceivableApi.getAccountReceivable(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useCreateAccountReceivableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsReceivableApi.createAccountReceivable,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "accountsReceivable.create" },
  });
};

export const useUpdateAccountReceivableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsReceivableApi.updateAccountReceivable,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: rootKey });
      await queryClient.invalidateQueries({ queryKey: [...rootKey, "detail", response.data.id] });
    },
    meta: { feature: "accountsReceivable.update" },
  });
};

export const useRecordAccountReceivablePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsReceivableApi.recordAccountReceivablePayment,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: rootKey });
      await queryClient.invalidateQueries({ queryKey: [...rootKey, "detail", response.data.id] });
    },
    meta: { feature: "accountsReceivable.payment" },
  });
};

export const useDeleteAccountReceivableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsReceivableApi.deleteAccountReceivable,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "accountsReceivable.delete" },
  });
};
