import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Target,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardActivityItem } from "./dashboard-data";

type HealthCard = {
  title: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  tone: string;
};

export function DashboardOperationsFeed({
  activities,
  healthCards,
  focusWindow,
}: {
  activities: DashboardActivityItem[];
  healthCards: HealthCard[];
  focusWindow: string;
}) {
  return (
    <div className="min-w-0 space-y-6">
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>Operations pulse</CardTitle>
          <CardDescription>{focusWindow}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-px overflow-hidden rounded-b-2xl bg-border lg:grid-cols-3">
          {healthCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-background/90 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{card.title}</p>
                    <p className="text-2xl font-semibold tracking-tight">
                      {card.value}
                    </p>
                  </div>
                  <span className={`rounded-lg p-2 ${card.tone}`}>
                    <Icon className="size-4" />
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {card.detail}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>Latest activity</CardTitle>
          <CardDescription>
            Recent progress across member review, memos, offices, and system
            operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-xl border bg-background/70 p-4"
            >
              <span className="mt-0.5 rounded-full bg-muted p-2">
                {activity.tone === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : activity.tone === "warning" ? (
                  <AlertTriangle className="size-4 text-amber-600" />
                ) : (
                  <Info className="size-4 text-sky-600" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-6">
                    {activity.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {activity.detail}
                </p>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-dashed border-primary/20 bg-[linear-gradient(135deg,rgba(20,82,36,0.06),rgba(185,146,64,0.05))] p-4">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <p className="text-sm font-medium">Suggested next action</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review unresolved applicant actions, confirm ministry schedules,
              and keep branch leadership readiness visible before the next
              service window.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
