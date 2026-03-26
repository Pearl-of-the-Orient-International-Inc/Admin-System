import { ArrowRight, BellRing, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardHeader() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative">
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="size-3.5" />
              Ministry operations overview
            </Badge>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Dashboard
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Monitor member intake, onboarding bottlenecks, event schedules,
                memo circulation, office readiness, and operational follow-ups
                from one front page.
              </p>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-5">
            <div className="rounded-xl border bg-background/80 lg:col-span-2 p-4 shadow-xs">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Today&apos;s focus
              </p>
              <p className="mt-2 text-sm font-medium">
                Clear the pending application queue before tomorrow&apos;s online
                interview block.
              </p>
            </div>
            <div className="flex items-center lg:col-span-3 justify-between rounded-xl border bg-linear-to-bl from-transparent to-primary/20 p-4 shadow-xs">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Attention needed
                </p>
                <p className="text-sm font-medium">
                  3 reminders tied to memos, office coverage, and schedules
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/members/pending">
                  <BellRing className="size-4" />
                  Review
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
