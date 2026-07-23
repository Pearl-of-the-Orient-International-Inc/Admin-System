import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ledgerApi from "./cashflow-ledger.api";
import type { LedgerQueryParams } from "./cashflow-ledger.types";

const rootKey = ["accounting", "cashflow-ledger"] as const;

export const useLedgerTransactionsQuery = (params: LedgerQueryParams = {}) =>
  useQuery({
    queryKey: [...rootKey, "list", params],
    queryFn: () => ledgerApi.getLedgerTransactions(params),
    staleTime: 30_000,
  });

export const useCreateLedgerTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ledgerApi.createLedgerTransaction,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "cashflowLedger.create" },
  });
};

export const useUpdateLedgerTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ledgerApi.updateLedgerTransaction,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "cashflowLedger.update" },
  });
};

export const useDeleteLedgerTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ledgerApi.deleteLedgerTransaction,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "cashflowLedger.delete" },
  });
};
