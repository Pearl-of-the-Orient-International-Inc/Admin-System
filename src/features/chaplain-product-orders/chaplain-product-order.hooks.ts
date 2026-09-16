import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as orderApi from "./chaplain-product-order.api";

const orderListKey = ["chaplain-product-orders", "list"];

export const useChaplainProductOrdersQuery = () =>
  useQuery({
    queryKey: orderListKey,
    queryFn: orderApi.getChaplainProductOrders,
    staleTime: 15_000,
  });

export const useUpdateChaplainProductOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.updateChaplainProductOrderStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderListKey }),
        queryClient.invalidateQueries({ queryKey: ["chaplain-products"] }),
      ]);
    },
    meta: { feature: "chaplain-product-orders.update-status" },
  });
};
