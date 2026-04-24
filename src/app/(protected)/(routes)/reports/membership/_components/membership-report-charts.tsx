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
  Pie,
  PieChart,
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
import type { MembershipReportData } from "@/lib/api-types";

const movementChartConfig = {
  applications: {
    label: "Applications",
    color: "#2563eb",
  },
  approvals: {
    label: "Approvals",
    color: "#16a34a",
  },
  archived: {
    label: "Archived",
    color: "#64748b",
  },
} satisfies ChartConfig;

const onboardingChartConfig = {
  members: {
    label: "Members",
    color: "#0f766e",
  },
} satisfies ChartConfig;

const typeChartConfig = {
  members: {
    label: "Members",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

const lineTrendChartConfig = {
  applications: {
    label: "Applications",
    color: "#2563eb",
  },
  approvals: {
    label: "Approvals",
    color: "#16a34a",
  },
  approvalRate: {
    label: "Approval rate",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

const areaChartConfig = {
  activeTotal: {
    label: "Active roster",
    color: "#0f766e",
  },
} satisfies ChartConfig;

const statusPieChartConfig = {
  Approved: {
    label: "Approved",
    color: "#16a34a",
  },
  Pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  Rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
  Archived: {
    label: "Archived",
    color: "#64748b",
  },
} satisfies ChartConfig;

export function MembershipMovementChart({
  data,
}: {
  data: MembershipReportData["trendData"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Membership movement</CardTitle>
        <CardDescription>
          Applications are based on creation dates, while approvals and archived
          counts follow the latest record update in each month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={movementChartConfig} className="h-98 w-full">
          <BarChart data={data} margin={{ left: -30 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={5} />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                />
              )}
            />
            <Bar
              dataKey="applications"
              fill="var(--color-applications)"
              maxBarSize={28}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="approvals"
              fill="var(--color-approvals)"
              maxBarSize={28}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="archived"
              fill="var(--color-archived)"
              maxBarSize={28}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MembershipStatusPanel({
  data,
}: {
  data: MembershipReportData["statusBreakdown"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Status distribution</CardTitle>
        <CardDescription>
          Snapshot of the current roster mix across approved, pending, rejected,
          and archived records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">
                  {item.value.toLocaleString()} member
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

export function MembershipLineTrendChart({
  data,
}: {
  data: MembershipReportData["trendData"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Application vs approval trend</CardTitle>
        <CardDescription>
          A smoother month-by-month read of intake, approvals, and conversion
          efficiency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={lineTrendChartConfig} className="h-80 w-full">
          <LineChart data={data} margin={{ left: -30, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={5}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={5} />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                />
              )}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="var(--color-applications)"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="approvals"
              stroke="var(--color-approvals)"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MembershipAreaTrendChart({
  data,
}: {
  data: MembershipReportData["trendData"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Active roster buildup</CardTitle>
        <CardDescription>
          Shows how the active membership base accumulates across the selected
          months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={areaChartConfig}
          className="h-100 aspect-auto w-full"
        >
          <AreaChart data={data} margin={{ left: -30, right: 8 }}>
            <defs>
              <linearGradient
                id="membership-active-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-activeTotal)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-activeTotal)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={5}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
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
              dataKey="activeTotal"
              stroke="var(--color-activeTotal)"
              fill="url(#membership-active-fill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MembershipStatusPieChart({
  data,
}: {
  data: MembershipReportData["statusBreakdown"];
}) {
  const chartData = data.filter((item) => item.value > 0);

  if (!chartData.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Status share</CardTitle>
          <CardDescription>
            Pie view of the current membership status composition.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-80 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No status data is available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Status share</CardTitle>
        <CardDescription>
          Pie view of the current membership status composition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusPieChartConfig} className="h-80 w-full">
          <PieChart>
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  nameKey="label"
                />
              )}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
            >
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MembershipOnboardingChart({
  data,
}: {
  data: MembershipReportData["onboardingBreakdown"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Onboarding pipeline</CardTitle>
        <CardDescription>
          Where active members currently sit in the membership journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={onboardingChartConfig} className="h-88 w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: -30, right: 8 }}
          >
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
            <Bar dataKey="value" radius={999} barSize={26}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.fill ?? "var(--color-members)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MembershipTypeChart({
  data,
}: {
  data: MembershipReportData["typeBreakdown"];
}) {
  if (!data.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Member type mix</CardTitle>
          <CardDescription>
            Active membership distribution by chaplain role classification.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-88 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No active member type data is available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Member type mix</CardTitle>
        <CardDescription>
          Active membership distribution by chaplain role classification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={typeChartConfig}
          className="aspect-auto h-88 w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: -30, right: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={168}
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
            <Bar dataKey="value" radius={999} barSize={28}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.fill ?? "var(--color-members)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MembershipBranchPanel({
  data,
}: {
  data: MembershipReportData["branchBreakdown"];
}) {
  if (!data.length) {
    return (
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle>Branch-of-service demand</CardTitle>
          <CardDescription>
            Most selected ministry areas among active members in the roster.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-80 items-center justify-center text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            No branch preferences have been recorded for active members yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Branch-of-service demand</CardTitle>
        <CardDescription>
          Most selected ministry areas among active members in the roster.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col overflow-y-auto h-100 no-scrollbar">
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
                Preferred by {item.value.toLocaleString()} active member
                {item.value === 1 ? "" : "s"}
              </p>
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

export function MembershipInsightPanel({
  data,
}: {
  data: MembershipReportData["insights"];
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader className="border-b">
        <CardTitle>Highlights</CardTitle>
        <CardDescription>
          Quick readouts that help explain where membership momentum is
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
