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
            className="overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,246,0.94))] shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <CardHeader className="relative overflow-hidden pt-0!">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {item.title}
                  </p>
                  <CardTitle className="font-serif text-3xl tracking-tight text-primary">
                    {item.value}
                  </CardTitle>
                </div>
                <span className={`rounded-2xl p-2.5 shadow-xs ${item.tone}`}>
                  <Icon className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-sm font-semibold">{item.change}</p>
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
