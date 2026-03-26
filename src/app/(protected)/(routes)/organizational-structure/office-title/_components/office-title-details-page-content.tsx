"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthorCard } from "@/components/blogs/AuthorCard";
import { MobileTableOfContents } from "@/components/blogs/MobileToc";
import { TableOfContents } from "@/components/blogs/TableOfContents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficeTitleByIdQuery } from "@/features/office-title/office-title.hooks";
import type { OfficeTitleSection } from "@/features/office-title/office-title.types";

type OfficeTitleDetailsPageContentProps = {
  officeTitleId: string;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const sectionId = (section: OfficeTitleSection, index: number) =>
  section.id ?? (slugify(section.title) || `section-${index + 1}`);

const formatOfficeTitleLevel = (level: string) =>
  level
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

export function OfficeTitleDetailsPageContent({
  officeTitleId,
}: OfficeTitleDetailsPageContentProps) {
  const officeTitleQuery = useOfficeTitleByIdQuery(officeTitleId, true);

  if (officeTitleQuery.isLoading) {
    return (
      <section className="space-y-4 p-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-56 w-full" />
      </section>
    );
  }

  if (!officeTitleQuery.data) {
    return (
      <section className="space-y-4 p-10">
        <Button asChild variant="outline" size="sm">
          <Link href="/organizational-structure/office-title">
            <ArrowLeft className="size-4" />
            Back to Office Titles
          </Link>
        </Button>
        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle>Office title not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The requested office title does not exist or is not accessible.
          </CardContent>
        </Card>
      </section>
    );
  }

  const officeTitle = officeTitleQuery.data;

  return (
    <div>
      <div className="relative z-10 space-y-4 border-b border-border">
        <div className="flex flex-col gap-6 p-10">
          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href="/organizational-structure/office-title">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to all office titles</span>
              </Link>
            </Button>
            {officeTitle.sections && officeTitle.sections.length > 0 && (
              <div className="ml-3 flex flex-wrap gap-2 text-muted-foreground">
                {officeTitle.sections.map((section) => (
                  <span
                    key={section.title}
                    className="flex h-6 w-fit items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium text-muted-foreground"
                  >
                    {section.title}
                  </span>
                ))}
              </div>
            )}
            <span className="font-medium text-muted-foreground">
              {formatOfficeTitleLevel(officeTitle.level)}
            </span>
            <time className="font-medium text-muted-foreground">
              {formatDate(new Date(officeTitle.createdAt))}
            </time>
          </div>

          <h1 className="text-balance text-4xl font-medium tracking-tighter md:text-5xl lg:text-6xl">
            {officeTitle.name}
          </h1>

          {officeTitle.description && (
            <p className="max-w-4xl text-muted-foreground md:text-balance md:text-lg">
              {officeTitle.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="rounded-md border bg-muted px-3 py-1">
              Max slots:{" "}
              {officeTitle.maxSlots === null ? "Unlimited" : officeTitle.maxSlots}
            </span>
            <span className="rounded-md border bg-muted px-3 py-1">
              Sections: {officeTitle.sections?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl divide-x divide-border px-4 md:px-0">
        <div className="pointer-events-none absolute left-1/2 h-full w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 border-x border-border p-0 lg:w-full" />

        <main className="w-full overflow-hidden p-0">
          <div className="p-6 lg:p-10">
            <div className="prose prose-lg max-w-none prose-a:no-underline prose-headings:scroll-mt-8 prose-headings:text-balance prose-headings:font-semibold prose-headings:tracking-tight prose-li:marker:text-current prose-ol:list-decimal prose-p:text-balance prose-p:tracking-tight prose-ul:list-disc dark:prose-invert">
              {officeTitle.sections?.map((section, index) => (
                <section key={section.id ?? `${section.title}-${index}`} className="mb-8">
                  <h2 id={sectionId(section, index)}>{section.title}</h2>
                  {section.type === "list" ? (
                    <ul>
                      {(section.items ?? []).map((item, itemIndex) => (
                        <li key={item.id ?? `${item.content}-${itemIndex}`}>
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: section.content ?? "" }} />
                  )}
                </section>
              ))}
            </div>
          </div>
        </main>

        <aside className="hidden w-87.5 shrink-0 bg-muted/60 p-6 dark:bg-muted/20 lg:block lg:p-10">
          <div className="sticky top-20 space-y-8">
            <AuthorCard
              author={{
                name: "Kyle Andre Lim",
                position: "IT",
                avatar:
                  "https://cjeckc0z09.ufs.sh/f/BxBfZYEHOronFmLYtkSQqeuyGRYVTrfwS41nZdgJ0hp5H7tz",
              }}
            />
            <div className="rounded-lg border border-border bg-card p-6">
              <TableOfContents />
            </div>
          </div>
        </aside>
      </div>
      <MobileTableOfContents />
    </div>
  );
}
