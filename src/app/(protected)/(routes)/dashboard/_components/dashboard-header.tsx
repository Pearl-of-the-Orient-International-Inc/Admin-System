import {
  ArrowRight,
  BellRing,
  BookOpenText,
  HandHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardHeader() {
  return (
    <Card className="overflow-hidden border-primary/10 bg-[radial-gradient(circle_at_top_left,rgba(20,82,36,0.16),transparent_38%),linear-gradient(135deg,rgba(250,248,242,0.96),rgba(255,255,255,0.92))] shadow-sm">
      <CardContent className="relative p-0">
        <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,rgba(185,146,64,0.16),transparent_70%)] lg:block" />
        <div className="relative grid min-w-0 gap-5 p-5 lg:p-7 2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <Badge
              variant="info"
              className="gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-primary"
            >
              <Sparkles className="size-3.5" />
              Chaplaincy command overview
            </Badge>
            <div className="space-y-3">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary md:text-4xl">
                Dashboard
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                Oversee pastoral care, membership formation, field assignments,
                ministry readiness, and time-sensitive follow-through from one
                dignified operations screen built for a chaplaincy
                organization.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-xs backdrop-blur">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-4" />
                  <p className="text-xs font-semibold uppercase">
                    Stewardship
                  </p>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Protect coverage, approvals, and ministry continuity with
                  timely response.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-xs backdrop-blur">
                <div className="flex items-center gap-2 text-primary">
                  <HandHeart className="size-4" />
                  <p className="text-xs font-semibold uppercase">
                    Pastoral care
                  </p>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Keep applicant follow-through and member support visible at a
                  glance.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-xs backdrop-blur">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpenText className="size-4" />
                  <p className="text-xs font-semibold uppercase">
                    Formation
                  </p>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Track training flow, calendar readiness, and operational
                  discipline.
                </p>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-1">

            <div className="flex min-w-0 flex-col justify-between border border-[rgba(185,146,64,0.24)] bg-[linear-gradient(145deg,rgba(255,250,239,0.98),rgba(250,246,234,0.9))] p-5 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <BellRing className="size-4" />
                  <p className="text-xs font-semibold uppercase text-primary/75">
                    Attention needed
                  </p>
                </div>
                <p className="text-base font-semibold text-foreground">
                  3 reminders tied to memos, office coverage, and schedules
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Review the most urgent follow-ups before end of day and keep
                  the next ministry window fully staffed.
                </p>
              </div>
              <div className="mt-4">
                <Button asChild size="sm" className="w-full justify-between">
                  <Link href="/members/pending">
                    Open pending review
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
