import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as newsBlogApi from "./news-blog.api";
import { uploadNewsBlogMedia } from "./news-blog-upload.api";
import type { NewsBlogQueryParams } from "./news-blog.types";

export const useNewsBlogsQuery = (params: NewsBlogQueryParams = {}) =>
  useQuery({
    queryKey: ["news-blogs", "list", params],
    queryFn: () => newsBlogApi.getNewsBlogs(params),
    staleTime: 30_000,
  });

export const useNewsBlogByIdQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["news-blogs", "detail", id],
    queryFn: () => newsBlogApi.getNewsBlogById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });

export const useCreateNewsBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsBlogApi.createNewsBlog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["news-blogs", "list"] });
    },
    meta: { feature: "newsBlogs.create" },
  });
};

export const useUpdateNewsBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsBlogApi.updateNewsBlogById,
    onSuccess: async (updatedNewsBlog) => {
      await queryClient.invalidateQueries({ queryKey: ["news-blogs", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["news-blogs", "detail", updatedNewsBlog.id],
      });
    },
    meta: { feature: "newsBlogs.update" },
  });
};

export const useDeleteNewsBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsBlogApi.deleteNewsBlogById,
    onSuccess: async (_data, newsBlogId) => {
      await queryClient.invalidateQueries({ queryKey: ["news-blogs", "list"] });
      queryClient.removeQueries({ queryKey: ["news-blogs", "detail", newsBlogId] });
    },
    meta: { feature: "newsBlogs.delete" },
  });
};

export const usePublishNewsBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsBlogApi.publishNewsBlogById,
    onSuccess: async (updatedNewsBlog) => {
      await queryClient.invalidateQueries({ queryKey: ["news-blogs", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["news-blogs", "detail", updatedNewsBlog.id],
      });
    },
    meta: { feature: "newsBlogs.publish" },
  });
};

export const useArchiveNewsBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsBlogApi.archiveNewsBlogById,
    onSuccess: async (updatedNewsBlog) => {
      await queryClient.invalidateQueries({ queryKey: ["news-blogs", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["news-blogs", "detail", updatedNewsBlog.id],
      });
    },
    meta: { feature: "newsBlogs.archive" },
  });
};

export const useRetrieveNewsBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsBlogApi.retrieveNewsBlogById,
    onSuccess: async (updatedNewsBlog) => {
      await queryClient.invalidateQueries({ queryKey: ["news-blogs", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["news-blogs", "detail", updatedNewsBlog.id],
      });
    },
    meta: { feature: "newsBlogs.retrieve" },
  });
};

export const useUploadNewsBlogMediaMutation = () =>
  useMutation({
    mutationFn: uploadNewsBlogMedia,
    meta: { feature: "newsBlogs.uploadMedia" },
  });
