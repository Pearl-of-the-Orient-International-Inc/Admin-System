"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FilePenLine,
  Copy,
  Eye,
  Globe,
  AlertTriangle,
  LoaderCircle,
  MoreHorizontal,
  Rocket,
  SquarePen,
  Trash2,
} from "lucide-react";

import {
  useDeleteNewsBlogMutation,
  usePublishNewsBlogMutation,
  useUpdateNewsBlogMutation,
} from "@/features/news-blogs/news-blog.hooks";
import { syncNewsBlogToFacebook } from "@/features/news-blogs/news-blog.api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NewsBlogRecord } from "@/features/news-blogs/news-blog.types";
import { toApiError } from "@/lib/http-client";

export function NewsBlogsActionsMenu({
  post,
  onViewPost,
}: {
  post: NewsBlogRecord;
  onViewPost?: (post: NewsBlogRecord) => void;
}) {
  const { toast } = useToast();
  const publishNewsBlogMutation = usePublishNewsBlogMutation();
  const deleteNewsBlogMutation = useDeleteNewsBlogMutation();
  const updateNewsBlogMutation = useUpdateNewsBlogMutation();
  const [isSyncingToFacebook, setIsSyncingToFacebook] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/news-blogs/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "The post link has been copied to your clipboard.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy the post link right now.",
        variant: "error",
      });
    }
  };

  const handlePublish = async () => {
    try {
      const publishedPost = await publishNewsBlogMutation.mutateAsync(post.id);

      if (publishedPost.facebookPostId) {
        await syncNewsBlogToFacebook({
          action: "update",
          newsBlog: publishedPost,
        });
      }

      toast({
        title: "Post published",
        description:
          "The news/blog post is now published and visible on Facebook.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description:
          toApiError(error).message ?? "Unable to publish the post right now.",
        variant: "error",
      });
    }
  };

  const handleMoveToDraft = async () => {
    if (isSyncingToFacebook) return;

    setIsMenuOpen(false);
    setIsSyncingToFacebook(true);

    try {
      if (post.facebookPostId) {
        await syncNewsBlogToFacebook({
          action: "hide",
          newsBlog: post,
        });
      }

      await updateNewsBlogMutation.mutateAsync({
        id: post.id,
        payload: buildNewsBlogUpdatePayload(post, {
          status: "DRAFT",
          scheduledAt: null,
          publishedAt: null,
        }),
      });

      toast({
        title: "Moved to draft",
        description: post.facebookPostId
          ? "The news/blog post is now draft and the linked Facebook Page post was hidden."
          : "The news/blog post is now draft.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Draft failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to move this post to draft right now.",
        variant: "error",
      });
    } finally {
      setIsSyncingToFacebook(false);
    }
  };

  const handleDelete = async () => {
    if (isSyncingToFacebook) return;

    setIsSyncingToFacebook(true);

    try {
      if (post.facebookPostId) {
        await syncNewsBlogToFacebook({
          action: "delete",
          newsBlog: post,
        });
      }

      await deleteNewsBlogMutation.mutateAsync(post.id);

      toast({
        title: "Post deleted",
        description: post.facebookPostId
          ? "The news/blog post and linked Facebook Page post were deleted."
          : "The news/blog post was deleted.",
        variant: "success",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : toApiError(error).message ||
              "Unable to delete this post right now.",
        variant: "error",
      });
    } finally {
      setIsSyncingToFacebook(false);
    }
  };

  const handleSyncToFacebook = async () => {
    if (isSyncingToFacebook) return;

    setIsMenuOpen(false);
    setIsSyncingToFacebook(true);

    try {
      const facebookSync = await syncNewsBlogToFacebook({
        action: "manual",
        newsBlog: post,
      });

      if (facebookSync?.postId && facebookSync.postId !== post.facebookPostId) {
        await updateNewsBlogMutation.mutateAsync({
          id: post.id,
          payload: buildNewsBlogUpdatePayload(post, {
            facebookPostId: facebookSync.postId,
          }),
        });
      }

      toast({
        title: "Synced to Facebook",
        description:
          facebookSync?.mode === "updated"
            ? "The selected news/blog post updated the existing Facebook Page post."
            : "The selected news/blog post was published to the Facebook Page.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Facebook sync failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to sync this post to Facebook right now.",
        variant: "error",
      });
    } finally {
      setIsSyncingToFacebook(false);
    }
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${post.title}`}
            disabled={isSyncingToFacebook}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {onViewPost ? (
            <DropdownMenuItem onClick={() => onViewPost(post)}>
              <Eye className="size-4" />
              View preview
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="size-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/news-blogs/${post.id}`}>
              <SquarePen className="size-4" />
              Edit post
            </Link>
          </DropdownMenuItem>
          {post.isActive && post.status === "DRAFT" ? (
            <DropdownMenuItem onClick={handlePublish}>
              <Rocket className="size-4" />
              Publish post
            </DropdownMenuItem>
          ) : null}
          {post.isActive && post.status !== "DRAFT" ? (
            <DropdownMenuItem
              onClick={handleMoveToDraft}
              disabled={isSyncingToFacebook}
            >
              <FilePenLine className="size-4" />
              Move to draft
            </DropdownMenuItem>
          ) : null}
          {post.isActive ? (
            <DropdownMenuItem
              onClick={handleSyncToFacebook}
              disabled={isSyncingToFacebook}
            >
              <Globe className="size-4" />
              Sync to Facebook
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setIsMenuOpen(false);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle className="size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete news/blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the news/blog entry
              {post.facebookPostId
                ? " and its linked Facebook Page post."
                : "."}{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSyncingToFacebook}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isSyncingToFacebook}
            >
              <Trash2 className="size-4" />
              {isSyncingToFacebook ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSyncingToFacebook}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader className="items-center text-center">
            <div
              role="status"
              aria-live="polite"
              className="bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full"
            >
              <LoaderCircle className="size-6 animate-spin" />
              <span className="sr-only">Syncing to Facebook</span>
            </div>
            <DialogTitle>Updating Facebook</DialogTitle>
            <DialogDescription className="text-center">
              Applying the requested change to the Facebook Page. Keep this
              window open until it finishes.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

type NewsBlogUpdatePayloadOverrides = Partial<{
  status: NewsBlogRecord["status"];
  scheduledAt: string | null;
  publishedAt: string | null;
  facebookPostId: string | null;
}>;

function buildNewsBlogUpdatePayload(
  post: NewsBlogRecord,
  overrides: NewsBlogUpdatePayloadOverrides = {},
) {
  const hasOverride = (key: keyof NewsBlogUpdatePayloadOverrides) =>
    Object.prototype.hasOwnProperty.call(overrides, key);

  return {
    title: post.title,
    caption: post.caption,
    media: post.media.map((item) => ({
      kind: item.kind === "image" ? ("IMAGE" as const) : ("VIDEO" as const),
      fileUrl: item.previewUrl,
      fileName: item.fileName,
    })),
    taggedMemberIds: post.taggedMembers.map((member) => member.id),
    hashtags: post.hashtags,
    facebookPostId: hasOverride("facebookPostId")
      ? overrides.facebookPostId
      : post.facebookPostId,
    platform: "FACEBOOK" as const,
    status: hasOverride("status") ? overrides.status : post.status,
    scheduledAt: hasOverride("scheduledAt")
      ? overrides.scheduledAt
      : post.scheduledAt,
    publishedAt: hasOverride("publishedAt")
      ? overrides.publishedAt
      : post.publishedAt,
  };
}
