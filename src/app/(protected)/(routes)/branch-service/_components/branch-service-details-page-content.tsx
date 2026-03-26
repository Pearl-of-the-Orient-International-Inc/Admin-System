"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchServiceByIdQuery } from "@/features/branch-service/branch-service.hooks";

import { AuthorCard } from "@/components/blogs/AuthorCard";
import { TableOfContents } from "@/components/blogs/TableOfContents";
import type { BranchSection } from "@/features/branch-service/branch-service.types";
import { MobileTableOfContents } from "@/components/blogs/MobileToc";

type BranchServiceDetailsPageContentProps = {
  branchServiceId: string;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const sectionId = (section: BranchSection, index: number) =>
  section.id ?? (slugify(section.title) || `section-${index + 1}`);

export function BranchServiceDetailsPageContent({
  branchServiceId,
}: BranchServiceDetailsPageContentProps) {
  const branchServiceQuery = useBranchServiceByIdQuery(branchServiceId, true);

  if (branchServiceQuery.isLoading) {
    return (
      <section className="space-y-4 p-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-56 w-full" />
      </section>
    );
  }

  if (!branchServiceQuery.data) {
    return (
      <section className="space-y-4 p-10">
        <Button asChild variant="outline" size="sm">
          <Link href="/branch-service">
            <ArrowLeft className="size-4" />
            Back to Branch Services
          </Link>
        </Button>
        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle>Branch service not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The requested branch service does not exist or is not accessible.
          </CardContent>
        </Card>
      </section>
    );
  }

  const branchService = branchServiceQuery.data;

  return (
    <div>
      <div className="space-y-4 border-b border-border relative z-10">
        <div className="flex flex-col gap-6 p-10">
          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href="/branch-service">
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">Back to all branch of services</span>
              </Link>
            </Button>
            {branchService.sections && branchService.sections.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-3 text-muted-foreground">
                {branchService.sections.map((section) => (
                  <span
                    key={section.title}
                    className="h-6 w-fit px-3 text-sm font-medium bg-muted text-muted-foreground rounded-md border flex items-center justify-center"
                  >
                    {section.title}
                  </span>
                ))}
              </div>
            )}
            <time className="font-medium text-muted-foreground">
              {formatDate(new Date(branchService.createdAt))}
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-balance">
            {branchService.title}
          </h1>

          {branchService.description && (
            <p className="text-muted-foreground max-w-4xl md:text-lg md:text-balance">
              {branchService.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex divide-x divide-border relative max-w-7xl mx-auto px-4 md:px-0 z-10">
        <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-border p-0 pointer-events-none" />

        <main className="w-full p-0 overflow-hidden">
          <div className="p-6 lg:p-10">
            <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-lg prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-current">
              {branchService.sections?.map((section, index) => (
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

        <aside className="hidden lg:block w-87.5 shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-8">
            <AuthorCard author={{
              name: "Kyle Andre Lim",
              position: "IT",
              avatar: "https://cjeckc0z09.ufs.sh/f/BxBfZYEHOronFmLYtkSQqeuyGRYVTrfwS41nZdgJ0hp5H7tz"
            }} />
            <div className="border border-border rounded-lg p-6 bg-card">
              <TableOfContents />
            </div>
          </div>
        </aside>
      </div>
      <MobileTableOfContents />
    </div>
  );
}
