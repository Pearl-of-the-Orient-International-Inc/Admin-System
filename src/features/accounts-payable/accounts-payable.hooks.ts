import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as accountsPayableApi from "./accounts-payable.api";
import type { AccountingPayableQueryParams } from "./accounts-payable.types";

export const useAccountsPayableQuery = (
  params: AccountingPayableQueryParams = {},
) =>
  useQuery({
    queryKey: ["accounting", "accounts-payable", "list", params],
    queryFn: () => accountsPayableApi.getAccountsPayable(params),
    staleTime: 30_000,
  });

export const useAccountPayableQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["accounting", "accounts-payable", "detail", id],
    queryFn: () => accountsPayableApi.getAccountPayable(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useCreateAccountPayableMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsPayableApi.createAccountPayable,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable"],
      });
    },
    meta: { feature: "accountsPayable.create" },
  });
};

export const useUpdateAccountPayableMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsPayableApi.updateAccountPayable,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable", "detail", response.data.id],
      });
    },
    meta: { feature: "accountsPayable.update" },
  });
};

export const useUpdateAccountPayableStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsPayableApi.updateAccountPayableStatus,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable", "detail", response.data.id],
      });
    },
    meta: { feature: "accountsPayable.status" },
  });
};

export const useRecordAccountPayablePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsPayableApi.recordAccountPayablePayment,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable", "detail", response.data.id],
      });
    },
    meta: { feature: "accountsPayable.payment" },
  });
};

export const useDeleteAccountPayableMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsPayableApi.deleteAccountPayable,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounting", "accounts-payable"],
      });
    },
    meta: { feature: "accountsPayable.delete" },
  });
};
