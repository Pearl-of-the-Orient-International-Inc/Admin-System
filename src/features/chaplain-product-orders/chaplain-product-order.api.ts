import { api } from "@/lib/http-client";
import type {
  ChaplainOrderStatus,
  ChaplainProductOrderListResponse,
  ChaplainProductOrderResponse,
} from "./chaplain-product-order.types";

export async function getChaplainProductOrders() {
  const { data } = await api.get<ChaplainProductOrderListResponse>(
    "/chaplain-product-orders",
    { params: { limit: 200, sortOrder: "desc" } },
  );
  return data;
}

export async function updateChaplainProductOrderStatus({
  id,
  status,
}: {
  id: string;
  status: ChaplainOrderStatus;
}) {
  const { data } = await api.patch<ChaplainProductOrderResponse>(
    `/chaplain-product-orders/${encodeURIComponent(id)}/status`,
    { status },
  );
  return data.data;
}
