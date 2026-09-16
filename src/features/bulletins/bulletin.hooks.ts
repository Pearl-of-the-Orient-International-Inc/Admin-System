import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bulletinApi from "./bulletin.api";
import { uploadBulletinFile } from "./bulletin-upload.api";
import type { BulletinEntryQueryParams } from "./bulletin.types";

const listKey = ["bulletins", "list"];

export const useBulletinEntriesQuery = (
  params: BulletinEntryQueryParams = {},
) =>
  useQuery({
    queryKey: [...listKey, params],
    queryFn: () => bulletinApi.getBulletinEntries(params),
    staleTime: 30_000,
  });

const useBulletinMutation = <TVariables,>(
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

export const useCreateBulletinEntryMutation = () =>
  useBulletinMutation(bulletinApi.createBulletinEntry, "bulletins.create");
export const useUpdateBulletinEntryMutation = () =>
  useBulletinMutation(bulletinApi.updateBulletinEntry, "bulletins.update");
export const usePublishBulletinEntryMutation = () =>
  useBulletinMutation(bulletinApi.publishBulletinEntry, "bulletins.publish");
export const useUnpublishBulletinEntryMutation = () =>
  useBulletinMutation(bulletinApi.unpublishBulletinEntry, "bulletins.unpublish");
export const useArchiveBulletinEntryMutation = () =>
  useBulletinMutation(bulletinApi.archiveBulletinEntry, "bulletins.archive");
export const useRestoreBulletinEntryMutation = () =>
  useBulletinMutation(bulletinApi.restoreBulletinEntry, "bulletins.restore");

export const useUploadBulletinFileMutation = () =>
  useMutation({
    mutationFn: uploadBulletinFile,
    meta: { feature: "bulletins.upload" },
  });
