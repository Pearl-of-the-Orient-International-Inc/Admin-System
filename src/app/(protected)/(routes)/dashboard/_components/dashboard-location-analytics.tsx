"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemberLocationReportQuery } from "@/features/reports/report.hooks";
import type { MemberLocationGranularity } from "@/features/reports/report.types";
import { useAddressData } from "@/lib/address-selection";
import type { MemberLocationReportData } from "@/lib/api-types";

const granularityOptions: Array<{
  value: MemberLocationGranularity;
  label: string;
}> = [
  { value: "province", label: "Province" },
  { value: "municipality", label: "Municipality / City" },
  { value: "barangay", label: "Barangay" },
];

export function DashboardLocationAnalytics() {
  const [granularity, setGranularity] =
    useState<MemberLocationGranularity>("province");
  const [seriesDisplayMode, setSeriesDisplayMode] = useState<"all" | "top5">(
    "all",
  );
  const [seriesSearch, setSeriesSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");

  const { regionOptions, provinceOptions, municipalityOptions } = useAddressData(
    selectedRegion,
    selectedProvince,
    selectedMunicipality,
  );

  const params = useMemo(
    () => ({
      months: 6,
      granularity,
      region: selectedRegion || undefined,
      province: selectedProvince || undefined,
      municipalityCity: selectedMunicipality || undefined,
    }),
    [granularity, selectedMunicipality, selectedProvince, selectedRegion],
  );

  const locationReportQuery = useMemberLocationReportQuery(params);
  const activeFilterLabels = useMemo(
    () =>
      [
        selectedRegion ? `Region: ${selectedRegion}` : "Region: All",
        granularity !== "province" && selectedProvince
          ? `Province: ${selectedProvince}`
          : granularity !== "province"
            ? "Province: All"
            : null,
        granularity === "barangay" && selectedMunicipality
          ? `Municipality: ${selectedMunicipality}`
          : granularity === "barangay"
            ? "Municipality: All"
            : null,
      ].filter(Boolean) as string[],
    [granularity, selectedMunicipality, selectedProvince, selectedRegion],
  );

  return (
    <div className="space-y-6 min-w-0">
      <DashboardLocationTrendCard
        queryState={{
          isLoading: locationReportQuery.isLoading,
          isError: locationReportQuery.isError,
          data: locationReportQuery.data,
          error:
            locationReportQuery.error instanceof Error
              ? locationReportQuery.error
              : null,
        }}
        granularity={granularity}
        seriesDisplayMode={seriesDisplayMode}
        seriesSearch={seriesSearch}
        selectedRegion={selectedRegion}
        selectedProvince={selectedProvince}
        selectedMunicipality={selectedMunicipality}
        activeFilterLabels={activeFilterLabels}
        regionOptions={regionOptions}
        provinceOptions={provinceOptions}
        municipalityOptions={municipalityOptions}
        onGranularityChange={(value) => {
          setGranularity(value);

          if (value === "province") {
            setSelectedProvince("");
            setSelectedMunicipality("");
            return;
          }

          if (value === "municipality") {
            setSelectedMunicipality("");
          }
        }}
        onRegionChange={(value) => {
          const nextValue = value === "all" ? "" : value;
          setSelectedRegion(nextValue);
          setSelectedProvince("");
          setSelectedMunicipality("");
        }}
        onProvinceChange={(value) => {
          const nextValue = value === "all" ? "" : value;
          setSelectedProvince(nextValue);
          setSelectedMunicipality("");
        }}
        onMunicipalityChange={(value) => {
          setSelectedMunicipality(value === "all" ? "" : value);
        }}
        onSeriesDisplayModeChange={setSeriesDisplayMode}
        onSeriesSearchChange={setSeriesSearch}
      />

      <DashboardRegionShareCard
        queryState={{
          isLoading: locationReportQuery.isLoading,
          isError: locationReportQuery.isError,
          data: locationReportQuery.data,
          error:
            locationReportQuery.error instanceof Error
              ? locationReportQuery.error
              : null,
        }}
      />
    </div>
  );
}

function DashboardRegionShareCard({
  queryState,
}: {
  queryState: QueryState;
}) {
  const regionData = useMemo(
    () => queryState.data?.regionBreakdown ?? [],
    [queryState.data?.regionBreakdown],
  );
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        regionData.map((item) => [
          item.label,
          {
            label: item.label,
            color: item.fill,
          },
        ]),
      ) satisfies ChartConfig,
    [regionData],
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-card/95 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle>Regional member share</CardTitle>
        <CardDescription>
          Active member distribution by region across the national roster.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {queryState.isLoading ? (
          <div className="h-88 w-full rounded-xl border bg-muted/40" />
        ) : queryState.isError ? (
          <div className="flex min-h-88 items-center justify-center text-center">
            <p className="text-muted-foreground max-w-xs text-sm">
              {queryState.error?.message ??
                "Unable to load regional member share right now."}
            </p>
          </div>
        ) : !regionData.length ? (
          <div className="flex min-h-88 items-center justify-center text-center">
            <p className="text-muted-foreground max-w-xs text-sm">
              No member location data is available yet.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-72 w-full overflow-hidden md:h-80"
          >
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
                data={regionData}
                dataKey="value"
                nameKey="label"
                innerRadius={58}
                outerRadius={94}
                paddingAngle={4}
              >
                {regionData.map((item) => (
                  <Cell key={item.label} fill={item.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="label" />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardLocationTrendCard({
  queryState,
  granularity,
  seriesDisplayMode,
  seriesSearch,
  selectedRegion,
  selectedProvince,
  selectedMunicipality,
  activeFilterLabels,
  regionOptions,
  provinceOptions,
  municipalityOptions,
  onGranularityChange,
  onRegionChange,
  onProvinceChange,
  onMunicipalityChange,
  onSeriesDisplayModeChange,
  onSeriesSearchChange,
}: {
  queryState: QueryState;
  granularity: MemberLocationGranularity;
  seriesDisplayMode: "all" | "top5";
  seriesSearch: string;
  selectedRegion: string;
  selectedProvince: string;
  selectedMunicipality: string;
  activeFilterLabels: string[];
  regionOptions: string[];
  provinceOptions: string[];
  municipalityOptions: string[];
  onGranularityChange: (value: MemberLocationGranularity) => void;
  onRegionChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onMunicipalityChange: (value: string) => void;
  onSeriesDisplayModeChange: (value: "all" | "top5") => void;
  onSeriesSearchChange: (value: string) => void;
}) {
  const trend = queryState.data?.locationTrend;
  const allSeries = useMemo(() => trend?.series ?? [], [trend?.series]);
  const searchedSeries = useMemo(() => {
    const normalizedSearch = seriesSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return allSeries;
    }

    return allSeries.filter((item) =>
      item.label.toLowerCase().includes(normalizedSearch),
    );
  }, [allSeries, seriesSearch]);
  const visibleSeries = useMemo(
    () =>
      seriesDisplayMode === "top5"
        ? searchedSeries.slice(0, 5)
        : searchedSeries,
    [searchedSeries, seriesDisplayMode],
  );
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        visibleSeries.map((item) => [
          item.key,
          {
            label: item.label,
            color: item.color,
          },
        ]),
      ) satisfies ChartConfig,
    [visibleSeries],
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-card/95 shadow-xs">
      <CardHeader className="border-b">
        <div className="flex min-w-0 flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="min-w-0">
            <CardTitle className="font-serif text-2xl text-primary">
              Location movement
            </CardTitle>
            <CardDescription>
              {queryState.data?.summary.scopeLabel ??
                "Member registrations per month grouped by the selected location scope."}
            </CardDescription>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border bg-background/70 px-2.5 py-1">
                Metric: New active member records created per month
              </span>
              <span className="rounded-full border bg-background/70 px-2.5 py-1">
                Window: Last 6 months
              </span>
              <span className="rounded-full border bg-background/70 px-2.5 py-1">
                Series: Showing {visibleSeries.length} of {allSeries.length} locations
              </span>
              <span className="rounded-full border bg-background/70 px-2.5 py-1">
                View: {seriesDisplayMode === "all" ? "All matches" : "Top 5 matches"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {activeFilterLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-dashed bg-background/70 px-2.5 py-1"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap gap-3 2xl:max-w-[44rem] 2xl:justify-end">
            <div className="flex items-center rounded-lg border bg-background p-1">
              <Button
                type="button"
                variant={seriesDisplayMode === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => onSeriesDisplayModeChange("all")}
              >
                All
              </Button>
              <Button
                type="button"
                variant={seriesDisplayMode === "top5" ? "default" : "ghost"}
                size="sm"
                onClick={() => onSeriesDisplayModeChange("top5")}
              >
                Top 5
              </Button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={seriesSearch}
                onChange={(event) => onSeriesSearchChange(event.target.value)}
                placeholder="Search location"
                className="pl-9"
              />
            </div>

            <Select value={granularity} onValueChange={onGranularityChange}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Granularity" />
              </SelectTrigger>
              <SelectContent>
                {granularityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedRegion || "all"}
              onValueChange={onRegionChange}
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(granularity === "municipality" || granularity === "barangay") && (
              <Select
                value={selectedProvince || "all"}
                onValueChange={onProvinceChange}
                disabled={!selectedRegion}
              >
                <SelectTrigger className="w-full md:w-52">
                  <SelectValue
                    placeholder={
                      selectedRegion ? "All provinces" : "Select region first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All provinces</SelectItem>
                  {provinceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {granularity === "barangay" && (
              <Select
                value={selectedMunicipality || "all"}
                onValueChange={onMunicipalityChange}
                disabled={!selectedProvince}
              >
                <SelectTrigger className="w-full md:w-60">
                  <SelectValue
                    placeholder={
                      selectedProvince
                        ? "All municipalities"
                        : "Select province first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All municipalities</SelectItem>
                  {municipalityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {queryState.data ? (
          <div className="grid gap-3 rounded-2xl border border-primary/10 bg-[linear-gradient(135deg,rgba(20,82,36,0.05),rgba(185,146,64,0.04))] p-4 text-sm md:grid-cols-3">
            <div className="rounded-xl bg-background/85 p-4 shadow-xs">
              <p className="text-muted-foreground">Active members</p>
              <p className="font-semibold">
                {queryState.data.summary.totalActiveMembers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-background/85 p-4 shadow-xs">
              <p className="text-muted-foreground">With full address data</p>
              <p className="font-semibold">
                {queryState.data.summary.membersWithLocation.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-background/85 p-4 shadow-xs">
              <p className="text-muted-foreground">Missing some address fields</p>
              <p className="font-semibold">
                {queryState.data.summary.membersWithoutLocation.toLocaleString()}
              </p>
            </div>
          </div>
        ) : null}

        {queryState.isLoading ? (
          <div className="h-88 w-full rounded-xl border bg-muted/40 md:h-96" />
        ) : queryState.isError ? (
          <div className="flex min-h-88 items-center justify-center text-center md:min-h-96">
            <p className="text-muted-foreground max-w-sm text-sm">
              {queryState.error?.message ??
                "Unable to load member location trends right now."}
            </p>
          </div>
        ) : !allSeries.length ? (
          <div className="flex min-h-88 items-center justify-center text-center md:min-h-96">
            <p className="text-muted-foreground max-w-sm text-sm">
              No member address trend data matched the current location filters.
            </p>
          </div>
        ) : !visibleSeries.length ? (
          <div className="flex min-h-88 items-center justify-center text-center md:min-h-96">
            <p className="text-muted-foreground max-w-sm text-sm">
              No locations matched your search. Try a different location name or
              switch back to all results.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <ChartContainer
              config={chartConfig}
              className="h-88 w-full overflow-hidden md:h-96"
            >
              <AreaChart
                data={trend?.data ?? []}
                margin={{ left: -12, right: 8, top: 8, bottom: 0 }}
              >
                <defs>
                  {visibleSeries.map((item) => (
                    <linearGradient
                      key={`${item.key}-fill`}
                      id={`${item.key}-fill`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={item.color} stopOpacity={0.35} />
                      <stop
                        offset="95%"
                        stopColor={item.color}
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  ))}
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
                {visibleSeries.map((item) => (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    fill={`url(#${item.key}-fill)`}
                    strokeWidth={2}
                    fillOpacity={1}
                  />
                ))}
                <ChartLegend
                  content={<ChartLegendContent className="justify-start xl:hidden" />}
                  verticalAlign="bottom"
                />
              </AreaChart>
            </ChartContainer>

            <div className="hidden rounded-2xl border bg-muted/20 p-4 xl:block">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Visible locations</p>
                  <p className="text-muted-foreground text-xs">
                    Searchable legend for the current chart view
                  </p>
                </div>
                <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  {visibleSeries.length}
                </span>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {visibleSeries.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between gap-3 rounded-xl border bg-background/85 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="min-w-0 text-sm leading-5 break-words">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {item.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type QueryState = {
  isLoading: boolean;
  isError: boolean;
  data?: MemberLocationReportData;
  error: Error | null;
};
