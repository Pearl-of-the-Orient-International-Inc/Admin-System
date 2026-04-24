"use client";

import type { CSSProperties } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MinistryReportData } from "@/lib/api-types";

const trendChartConfig = {
  total: {
    label: "All events",
    color: "#2563eb",
  },
  onsite: {
    label: "Onsite",
    color: "#16a34a",
  },
  online: {
    label: "Online",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

const completionChartConfig = {
  completed: {
    label: "Completed",
    color: "#0f766e",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  value: {
    label: "Events",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const leadershipChartConfig = {
  value: {
    label: "Filled slots",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export function MinistryActivityTrendChart({
  data,
}: {
  data: MinistryReportData["trendData"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Ministry activity trend</CardTitle>
        <CardDescription>
          Month-by-month view of overall activity volume across onsite and
          online ministry events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trendChartConfig} className="h-88 w-full">
          <LineChart data={data} margin={{ left: -30, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                />
              )}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-total)"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="onsite"
              stroke="var(--color-onsite)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="online"
              stroke="var(--color-online)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MinistryCompletionChart({
  data,
}: {
  data: MinistryReportData["trendData"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Completed activity buildup</CardTitle>
        <CardDescription>
          Shows how many ministry events have reached completion in each month
          of the current reporting window.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={completionChartConfig} className="h-88 w-full">
          <AreaChart data={data} margin={{ left: -30, right: 8 }}>
            <defs>
              <linearGradient
                id="ministry-completed-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="var(--color-completed)"
              fill="url(#ministry-completed-fill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MinistryStatusPanel({
  data,
}: {
  data: MinistryReportData["statusBreakdown"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Event status distribution</CardTitle>
        <CardDescription>
          Snapshot of scheduled, ongoing, completed, and cancelled ministry
          events in the current dataset.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">
                  {item.value.toLocaleString()} event
                  {item.value === 1 ? "" : "s"}
                </p>
              </div>
              <span className="text-sm font-semibold">{item.percentage}%</span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: item.fill,
                  } satisfies CSSProperties
                }
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MinistryCategoryChart({
  data,
}: {
  data: MinistryReportData["categoryBreakdown"];
}) {
  if (!data.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Category mix</CardTitle>
          <CardDescription>
            Distribution of ministry activities by event category.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-80 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No ministry event category data is available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Category mix</CardTitle>
        <CardDescription>
          Which ministry streams are carrying the most activity right now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={categoryChartConfig} className="h-88 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: -30, right: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={128}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  indicator="line"
                />
              )}
            />
            <Bar dataKey="value" radius={999} barSize={24}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.fill ?? "var(--color-value)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MinistryBranchPanel({
  data,
}: {
  data: MinistryReportData["branchBreakdown"];
}) {
  if (!data.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Branch utilization</CardTitle>
          <CardDescription>
            Member alignment across available ministry branches.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-88 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No branch utilization data is available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Branch utilization</CardTitle>
        <CardDescription>
          Branches with the strongest member alignment across the ministry
          roster.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-88 flex-col gap-4 overflow-y-auto no-scrollbar">
        {data.map((item, index) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {index + 1}. {item.label}
              </p>
              <p className="text-muted-foreground text-xs">
                {item.value.toLocaleString()} aligned member
                {item.value === 1 ? "" : "s"}
              </p>
              {item.detail ? (
                <p className="text-muted-foreground text-xs">{item.detail}</p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{item.percentage}%</p>
              <p className="text-muted-foreground text-xs">share</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MinistryLeadershipChart({
  data,
}: {
  data: MinistryReportData["leadershipBreakdown"];
}) {
  if (!data.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Leadership coverage by level</CardTitle>
          <CardDescription>
            Filled leadership slots grouped by ministry office level.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-88 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No active leadership assignments are available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Leadership coverage by level</CardTitle>
        <CardDescription>
          Shows where filled leadership capacity is concentrated in the
          organizational structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={leadershipChartConfig} className="h-88 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: -30, right: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={170}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  indicator="line"
                />
              )}
            />
            <Bar dataKey="value" radius={999} barSize={24}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.fill ?? "var(--color-value)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MinistryUpcomingPanel({
  data,
}: {
  data: MinistryReportData["upcomingEvents"];
}) {
  if (!data.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Upcoming ministry schedule</CardTitle>
          <CardDescription>
            The next few ministry activities queued on the live calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-80 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No upcoming ministry events are currently scheduled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Upcoming ministry schedule</CardTitle>
        <CardDescription>
          The next few ministry activities queued on the live calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-muted-foreground text-xs">
                  {item.category} • {item.type}
                </p>
                <p className="text-muted-foreground text-xs">
                  {item.startsAtLabel}
                </p>
                <p className="text-muted-foreground text-xs">{item.location}</p>
              </div>
              <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                {item.daysAwayLabel}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MinistryInsightPanel({
  data,
}: {
  data: MinistryReportData["insights"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Highlights</CardTitle>
        <CardDescription>
          Quick readouts that explain where ministry effort and staffing are
          concentrated right now.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {data.map((item) => (
          <div key={item.title} className="rounded-xl border bg-card p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              {item.title}
            </p>
            <p className="mt-2 text-base font-semibold">{item.value}</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
