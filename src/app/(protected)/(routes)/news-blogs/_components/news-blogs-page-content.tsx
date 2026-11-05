"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, ImageIcon, Newspaper, Plus, Tag } from "lucide-react";

import { PageEmptyState } from "@/components/PageEmptyState";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNewsBlogsQuery } from "@/features/news-blogs/news-blog.hooks";
import type { NewsBlogRecord } from "@/features/news-blogs/news-blog.types";
import { NewsBlogsDataTable } from "./news-blogs-data-table";
import { FacebookPageSettingsDialog } from "./facebook-page-settings-dialog";

export function NewsBlogsPageContent() {
  const newsBlogsQuery = useNewsBlogsQuery({ limit: 100, sortBy: "updatedAt" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const newsBlogRecords = newsBlogsQuery.data?.items ?? [];

  const [, setSelectedPost] = useState<NewsBlogRecord | null>(
    newsBlogRecords[0] ?? null,
  );

  const totalPosts = newsBlogRecords.length;
  const publishedPosts = useMemo(
    () =>
      newsBlogRecords.filter(
        (post) => post.isActive && post.status === "PUBLISHED",
      ).length,
    [newsBlogRecords],
  );
  const draftPosts = useMemo(
    () =>
      newsBlogRecords.filter((post) => post.isActive && post.status === "DRAFT")
        .length,
    [newsBlogRecords],
  );
  const scheduledPosts = useMemo(
    () =>
      newsBlogRecords.filter(
        (post) => post.isActive && post.status === "SCHEDULED",
      ).length,
    [newsBlogRecords],
  );

  if (!newsBlogsQuery.isLoading && !newsBlogRecords.length) {
    return (
      <section className="space-y-6 p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              News & Blogs
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage Facebook-ready post drafts, scheduled content, and
              published stories.
            </p>
          </div>
          <FacebookPageSettingsDialog />
        </div>

        <PageEmptyState
          title="No news posts found"
          description="Create your first Facebook post draft to start building the news and blogs publishing flow."
          createUrl="/news-blogs/create"
          createLabel="Create post"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            News & Blogs
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage Facebook-ready post drafts, scheduled content, and published
            stories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FacebookPageSettingsDialog />
          <Button asChild>
            <Link href="/news-blogs/create">
              <Plus className="size-4" />
              Create post
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Publishing Summary</CardTitle>
          <CardDescription>
            Quick snapshot of current news and blog posting activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label="Total Posts"
            value={totalPosts}
            description="All draft, scheduled, and published posts"
            icon={<Newspaper className="size-4" />}
            accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Published"
            value={publishedPosts}
            description="Already released to the social feed"
            icon={<ImageIcon className="size-4" />}
            accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryStatCard
            label="Drafts"
            value={draftPosts}
            description="Still being edited before publishing"
            icon={<Tag className="size-4" />}
            accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
          />
          <SummaryStatCard
            label="Scheduled"
            value={scheduledPosts}
            description="Queued posts waiting for release"
            icon={<CalendarClock className="size-4" />}
            accentClassName="bg-slate-700/10 text-slate-700 dark:bg-slate-300/10 dark:text-slate-300"
          />
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Post Directory</CardTitle>
          <CardDescription>
            Review all drafted, scheduled, and published Facebook post entries
            in one table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsBlogsDataTable
            data={newsBlogRecords}
            onViewPost={setSelectedPost}
          />
        </CardContent>
      </Card>
    </section>
  );
}
