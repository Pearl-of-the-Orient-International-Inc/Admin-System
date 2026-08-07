import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as acknowledgementReceiptsApi from "./acknowledgement-receipts.api";
import type { AcknowledgementReceiptQueryParams } from "./acknowledgement-receipts.types";

const rootKey = ["accounting", "acknowledgement-receipts"] as const;

export const useAcknowledgementReceiptsQuery = (
  params: AcknowledgementReceiptQueryParams = {},
) =>
  useQuery({
    queryKey: [...rootKey, "list", params],
    queryFn: () =>
      acknowledgementReceiptsApi.getAcknowledgementReceipts(params),
    staleTime: 30_000,
  });

export const useCreateAcknowledgementReceiptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgementReceiptsApi.createAcknowledgementReceipt,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "acknowledgementReceipts.create" },
  });
};

export const useDeleteAcknowledgementReceiptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgementReceiptsApi.deleteAcknowledgementReceipt,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: rootKey }),
    meta: { feature: "acknowledgementReceipts.delete" },
  });
};
