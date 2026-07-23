import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as invoicesApi from "./invoices.api";
import type { InvoiceQueryParams } from "./invoices.types";

const rootKey = ["accounting", "invoices"] as const;

export const useInvoicesQuery = (params: InvoiceQueryParams = {}) =>
  useQuery({
    queryKey: [...rootKey, "list", params],
    queryFn: () => invoicesApi.getInvoices(params),
    staleTime: 30_000,
  });

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.createInvoice,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "invoices.create" },
  });
};

export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.updateInvoiceStatus,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "invoices.updateStatus" },
  });
};

export const useDeleteInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.deleteInvoice,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "invoices.delete" },
  });
};
