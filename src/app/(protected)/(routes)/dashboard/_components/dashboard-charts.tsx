"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import type { DashboardReportData } from "@/lib/api-types";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  dashboardMonthlyTrends,
  dashboardOnboardingStages,
} from "./dashboard-data";

const trendChartConfig = {
  applications: {
    label: "Applications",
    color: "var(--color-chart-2)",
  },
  approvals: {
    label: "Approvals",
    color: "var(--color-chart-3)",
  },
  events: {
    label: "Events",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig;

const stageChartConfig = {
  members: {
    label: "Members in stage",
    color: "var(--color-chart-2)",
  },
  stageOrientation: {
    label: "Pre-orientation",
    color: "#0ea5e9",
  },
  stagePayment: {
    label: "Payment checkout",
    color: "#f59e0b",
  },
  stageInterview: {
    label: "Online interview",
    color: "#8b5cf6",
  },
  stageId: {
    label: "ID generation",
    color: "#10b981",
  },
  stageTraining: {
    label: "Chaplaincy training",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function DashboardCharts({
  trendData = dashboardMonthlyTrends,
  onboardingData = dashboardOnboardingStages.map((item) => ({
    label: item.stage,
    value: item.members,
    percentage: 0,
    fill: item.fill,
  })),
}: {
  trendData?: DashboardReportData["membershipTrend"];
  onboardingData?: DashboardReportData["onboardingBreakdown"];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Membership and events trend</CardTitle>
          <CardDescription>
            Monthly movement across applications, approvals, and scheduled
            activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={trendChartConfig}
            className="aspect-auto h-80 w-full"
          >
            <BarChart data={trendData} barCategoryGap="24%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
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
                dataKey="events"
                fill="var(--color-events)"
                maxBarSize={28}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Onboarding queue</CardTitle>
          <CardDescription>
            Frontend snapshot of where applicants currently sit in the flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={stageChartConfig}
            className="aspect-auto h-80 w-full"
          >
            <BarChart
              data={onboardingData}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                width={132}
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
              <Bar dataKey="value" radius={999} barSize={34}>
                {onboardingData.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
