"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageLoadingStateMode = "table" | "grid" | "calendar";

type PageLoadingStateProps = {
  mode: PageLoadingStateMode;
  className?: string;
};

export function PageLoadingState({
  mode,
  className,
}: PageLoadingStateProps) {
  if (mode === "grid") {
    return <GridLoadingState className={className} />;
  }

  if (mode === "calendar") {
    return <CalendarLoadingState className={className} />;
  }

  return <TableLoadingState className={className} />;
}

function TableLoadingState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-dashed bg-card/40 p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-full md:max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <div className="rounded-xl border bg-background/70">
        <div className="grid grid-cols-4 gap-3 border-b px-4 py-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`table-head-${index}`} className="h-4 w-full" />
          ))}
        </div>

        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div
              key={`table-row-${rowIndex}`}
              className="grid grid-cols-4 gap-3 lg:grid-cols-6"
            >
              {Array.from({ length: 6 }).map((_, colIndex) => (
                <Skeleton
                  key={`table-row-${rowIndex}-col-${colIndex}`}
                  className="h-10 w-full"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GridLoadingState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-dashed bg-card/40 p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-full md:max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`grid-card-${index}`}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <Skeleton className="h-56 w-full rounded-none" />
            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarLoadingState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-dashed bg-card/40 p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="rounded-xl border bg-background/70">
        <div className="grid grid-cols-7 gap-2 border-b px-4 py-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={`calendar-head-${index}`} className="h-4 w-14" />
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 p-4">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={`calendar-cell-${index}`}
              className="space-y-2 rounded-lg border bg-card p-3"
            >
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
