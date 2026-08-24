"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp, Film, Hash, ImageIcon, Tag } from "lucide-react";

import { GlobalDataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NewsBlogRecord } from "@/features/news-blogs/news-blog.types";
import { NewsBlogMediaGalleryDialog } from "./news-blog-media-gallery-dialog";
import { NewsBlogsActionsMenu } from "./news-blogs-actions-menu";

export function NewsBlogsDataTable({
  data,
  onViewPost,
}: {
  data: NewsBlogRecord[];
  onViewPost: (post: NewsBlogRecord) => void;
}) {
  const [mediaGalleryPost, setMediaGalleryPost] = useState<NewsBlogRecord | null>(
    null,
  );

  const columns = useMemo<ColumnDef<NewsBlogRecord>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Post
            <ArrowDownUp className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-85">
            <p className="font-medium line-clamp-1">{row.original.title}</p>
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {toPlainText(row.original.caption)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.isActive
                ? getStatusVariant(row.original.status)
                : "error"
            }
          >
            {row.original.isActive
              ? formatLabel(row.original.status)
              : "Archived"}
          </Badge>
        ),
      },
      {
        accessorKey: "media",
        header: "Media",
        cell: ({ row }) => {
          const imageCount = row.original.media.filter(
            (item) => item.kind === "image",
          ).length;
          const videoCount = row.original.media.filter(
            (item) => item.kind === "video",
          ).length;

          return (
            <button
              type="button"
              onClick={() => setMediaGalleryPost(row.original)}
              className="flex max-w-28 flex-wrap gap-1.5 text-left"
            >
              <Badge variant="outline">
                <ImageIcon className="size-3.5" />
                {imageCount} img
              </Badge>
              <Badge variant="outline">
                <Film className="size-3.5" />
                {videoCount} vid
              </Badge>
            </button>
          );
        },
      },
      {
        accessorKey: "taggedMembers",
        header: "Metadata",
        cell: ({ row }) => (
          <div className="min-w-40 space-y-0.5">
            <div className="font-medium text-sm flex gap-1 items-center">
              <Tag className="size-3.5" />
              {row.original.taggedMembers.length} tagged member{row.original.taggedMembers.length > 0 && "s"}
            </div>
            <div className="text-muted-foreground flex gap-0.5 items-center truncate flex-wrap text-xs">
              <Hash className="size-3.5" />
              {row.original.hashtags.length} tag{row.original.hashtags.length > 0 && "s"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            
          }),
      },
    ],
    [setMediaGalleryPost],
  );

  return (
    <>
      <GlobalDataTable
        data={data}
        columns={columns}
        filterPlaceholder="Search title, caption, status, or hashtag..."
        emptyMessage="No news or blog posts found."
        exportFileName="news-blogs"
        onDeleteSelected={() => undefined}
        cellAction={(row) => (
          <NewsBlogsActionsMenu post={row.original} onViewPost={onViewPost} />
        )}
        renderSelectedActions={(rows) => (
          <Button
            variant="destructive"
            size="xs"
            onClick={() => onViewPost(rows[0] as NewsBlogRecord)}
          >
            Preview selected
          </Button>
        )}
      />
      <NewsBlogMediaGalleryDialog
        post={mediaGalleryPost}
        open={Boolean(mediaGalleryPost)}
        onOpenChange={(open) => {
          if (!open) {
            setMediaGalleryPost(null);
          }
        }}
      />
    </>
  );
}

function toPlainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function getStatusVariant(status: NewsBlogRecord["status"]) {
  if (status === "PUBLISHED") return "success";
  if (status === "SCHEDULED") return "info";
  if (status === "DRAFT") return "warning";
  return "secondary";
}
