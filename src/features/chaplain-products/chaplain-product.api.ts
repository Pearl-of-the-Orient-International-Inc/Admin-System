import { api } from "@/lib/http-client";
import type {
  ChaplainProductEnvelopeResponse,
  ChaplainProductListResponse,
  ChaplainProductPayload,
} from "./chaplain-product.types";

export async function getChaplainProducts() {
  const { data } = await api.get<ChaplainProductListResponse>(
    "/chaplain-products",
    { params: { limit: 200, sortBy: "sortOrder", sortOrder: "asc" } },
  );
  return data;
}

export async function createChaplainProduct(payload: ChaplainProductPayload) {
  const { data } = await api.post<ChaplainProductEnvelopeResponse>(
    "/chaplain-products",
    payload,
  );
  return data.data;
}

export async function updateChaplainProduct({
  id,
  payload,
}: {
  id: string;
  payload: ChaplainProductPayload;
}) {
  const { data } = await api.put<ChaplainProductEnvelopeResponse>(
    `/chaplain-products/${encodeURIComponent(id)}`,
    payload,
  );
  return data.data;
}

export async function deleteChaplainProduct(id: string) {
  await api.delete(`/chaplain-products/${encodeURIComponent(id)}`);
}
