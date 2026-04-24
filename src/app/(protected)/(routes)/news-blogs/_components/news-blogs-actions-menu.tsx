"use client";

import Link from "next/link";
import {
  Archive,
  Copy,
  Eye,
  MoreHorizontal,
  Rocket,
  SquarePen,
  Undo2,
} from "lucide-react";

import {
  useArchiveNewsBlogMutation,
  usePublishNewsBlogMutation,
  useRetrieveNewsBlogMutation,
} from "@/features/news-blogs/news-blog.hooks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  const archiveNewsBlogMutation = useArchiveNewsBlogMutation();
  const retrieveNewsBlogMutation = useRetrieveNewsBlogMutation();

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
      await publishNewsBlogMutation.mutateAsync(post.id);
      toast({
        title: "Post published",
        description: "The news/blog post is now marked as published.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description: toApiError(error).message ?? "Unable to publish the post right now.",
        variant: "error",
      });
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (post.isActive) {
        await archiveNewsBlogMutation.mutateAsync(post.id);
        toast({
          title: "Post archived",
          description: "The news/blog post was archived successfully.",
          variant: "success",
        });
      } else {
        await retrieveNewsBlogMutation.mutateAsync(post.id);
        toast({
          title: "Post retrieved",
          description: "The news/blog post was restored successfully.",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: post.isActive ? "Archive failed" : "Retrieve failed",
        description:
          toApiError(error).message ??
          (post.isActive
            ? "Unable to archive the post right now."
            : "Unable to retrieve the post right now."),
        variant: "error",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${post.title}`}>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={post.isActive ? "destructive" : "default"}
          onClick={handleArchiveToggle}
        >
          {post.isActive ? (
            <Archive className="size-4" />
          ) : (
            <Undo2 className="size-4" />
          )}
          {post.isActive ? "Archive" : "Retrieve"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
