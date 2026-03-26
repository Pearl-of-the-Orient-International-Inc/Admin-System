import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardStat } from "./dashboard-data";

export function DashboardStatsGrid({ items }: { items: DashboardStat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="border-border/70 bg-card/90 shadow-xs transition-colors hover:border-primary/40"
          >
            <CardHeader className="pt-0!">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {item.title}
                  </p>
                  <CardTitle className="text-3xl tracking-tight">
                    {item.value}
                  </CardTitle>
                </div>
                <span className={`rounded-lg p-2 ${item.tone}`}>
                  <Icon className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-sm font-medium">{item.change}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
