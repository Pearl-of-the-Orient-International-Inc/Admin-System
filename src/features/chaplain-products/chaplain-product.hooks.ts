import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productApi from "./chaplain-product.api";
import { uploadChaplainProductImage } from "./chaplain-product-upload.api";

const listKey = ["chaplain-products", "list"];

export const useChaplainProductsQuery = () =>
  useQuery({
    queryKey: listKey,
    queryFn: productApi.getChaplainProducts,
    staleTime: 30_000,
  });

const useProductMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  feature: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
    meta: { feature },
  });
};

export const useCreateChaplainProductMutation = () =>
  useProductMutation(
    productApi.createChaplainProduct,
    "chaplain-products.create",
  );
export const useUpdateChaplainProductMutation = () =>
  useProductMutation(
    productApi.updateChaplainProduct,
    "chaplain-products.update",
  );
export const useDeleteChaplainProductMutation = () =>
  useProductMutation(
    productApi.deleteChaplainProduct,
    "chaplain-products.delete",
  );
export const useUploadChaplainProductImageMutation = () =>
  useMutation({
    mutationFn: uploadChaplainProductImage,
    meta: { feature: "chaplain-products.upload" },
  });
