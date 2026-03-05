"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type SettingsCardSkeletonProps = {
  title: string;
  lines?: number;
};

export const SettingsCardSkeleton = ({
  title,
  lines = 3,
}: SettingsCardSkeletonProps) => {
  return (
    <div>
      <p>{title}</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton key={`${title}-line-${index}`} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

