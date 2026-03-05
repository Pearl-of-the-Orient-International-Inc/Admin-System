import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CurrentSessionCardSkeleton = () => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>Current Session</CardTitle>
        <CardDescription>Information about your active session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ActiveSessionsCardSkeleton = () => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices and locations where you&apos;re currently signed in
            </CardDescription>
          </div>
          <Skeleton className="h-9 w-44" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`session-row-skeleton-${index}`}
                className="grid gap-4 md:grid-cols-[2fr_2fr_1.5fr_1.5fr]"
              >
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

