import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  categoryBreakdown,
  payableAging,
  payableBills,
  payableSummaryCards,
  payableTrend,
} from "./accounts-payable-data";

const toneStyles = {
  violet: "border-violet-100 bg-violet-50/45 text-violet-700",
  red: "border-red-100 bg-red-50/45 text-red-700",
  orange: "border-orange-100 bg-orange-50/45 text-orange-700",
  blue: "border-blue-100 bg-blue-50/45 text-blue-700",
  green: "border-emerald-100 bg-emerald-50/45 text-emerald-700",
};

const statusVariant = {
  Overdue: "error",
  "Due Soon": "warning",
  Partial: "info",
  Paid: "success",
  Open: "secondary",
} as const;

const categoryStyle: Record<string, string> = {
  "Supplies & Materials": "bg-cyan-100 text-cyan-700",
  Utilities: "bg-orange-100 text-orange-700",
  Services: "bg-blue-100 text-blue-700",
  Books: "bg-indigo-100 text-indigo-700",
  Maintenance: "bg-teal-100 text-teal-700",
};

function DonutChart({
  segments,
}: {
  segments: { color: string; amount: number }[];
}) {
  const gradient = segments
    .reduce(
      (state, segment) => {
        const start = state.offset;
        const nextOffset = start + segment.amount;
        return {
          offset: nextOffset,
          stops: [...state.stops, `${segment.color} ${start}% ${nextOffset}%`],
        };
      },
      { offset: 0, stops: [] as string[] },
    )
    .stops.join(", ");

  return (
    <div
      className="size-36 rounded-full"
      style={{ background: `conic-gradient(${gradient})` }}
    >
      <div className="m-auto flex size-20 translate-y-8 rounded-full bg-background" />
    </div>
  );
}

function PayablesTrendChart() {
  const width = 500;
  const height = 180;
  const padding = 24;
  const max = 150000;
  const xStep = (width - padding * 2) / (payableTrend.length - 1);
  const points = payableTrend
    .map((item, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (item.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-80 w-full">
        {[0, 25000, 50000, 75000, 125000, 150000].map((tick) => {
          const y = height - padding - (tick / max) * (height - padding * 2);
          return (
            <g key={tick}>
              <line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
              />
              <text
                x="0"
                y={y + 4}
                className="fill-muted-foreground text-[11px]"
              >
                ₱ {tick === 0 ? "0" : `${tick / 1000}K`}
              </text>
            </g>
          );
        })}
        {["May 1", "May 8", "May 15", "May 22", "May 29"].map(
          (label, index) => (
            <text
              key={label}
              x={padding + index * ((width - padding * 2) / 4)}
              y={height - 3}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {label}
            </text>
          ),
        )}
        <polyline
          points={points}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-center text-xs">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-green-500" />
          Outstanding Balance
        </span>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select defaultValue={value}>
        <SelectTrigger className="h-9 w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function AccountsPayablePage() {
  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Accounts Payable
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track and manage all your payables, bills, and vendor payments.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {payableSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="gap-0 p-5">
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "rounded-md border p-3",
                    toneStyles[card.tone as keyof typeof toneStyles],
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm tracking-tigher",
                      toneStyles[card.tone as keyof typeof toneStyles],
                      "border-0 bg-transparent p-0",
                    )}
                  >
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tighest">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden py-0">
        <div className="grid xl:grid-cols-[1.50fr_1fr_1fr]">
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Payables Trend (This Month)</h2>
            <PayablesTrendChart />
          </section>
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Accounts Payable Aging</h2>
            <p className="mt-1 text-xs">
              Total:{" "}
              <span className="font-semibold text-emerald-700">
                {payableAging.total}
              </span>
            </p>
            <div className="mt-5 grid gap-5">
              <DonutChart segments={payableAging.segments} />
              <div className="space-y-3 text-xs">
                {payableAging.segments.map((segment) => (
                  <div key={segment.label} className="flex gap-2">
                    <span
                      className="mt-1 size-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p className="font-semibold">
                        {segment.label}
                        <span className="ml-1 text-muted-foreground">
                          ({segment.percent})
                        </span>
                      </p>
                      <p className="text-muted-foreground">{segment.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-5">
            <h2 className="text-sm font-bold">
              Payables by Category (This Month)
            </h2>
            <div className="mt-5 grid gap-5">
              <DonutChart segments={categoryBreakdown.segments} />
              <div className="space-y-3 text-xs">
                {categoryBreakdown.segments.map((segment) => (
                  <div key={segment.label} className="flex gap-2">
                    <span
                      className="mt-1 size-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p className="font-semibold">
                        {segment.label}
                        <span className="ml-1 text-muted-foreground">
                          ({segment.percent})
                        </span>
                      </p>
                      <p className="text-muted-foreground">{segment.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[170px_150px_160px_170px_1fr_auto_auto]">
          <FilterSelect
            label="Date Range"
            value="may"
            options={["May 1 - May 31, 2025", "This Week", "This Quarter"]}
          />
          <FilterSelect
            label="Status"
            value="all"
            options={["All Status", "Overdue", "Due Soon", "Partial", "Paid"]}
          />
          <FilterSelect
            label="Category"
            value="all"
            options={["All Categories", "Utilities", "Services", "Books"]}
          />
          <FilterSelect
            label="Supplier"
            value="all"
            options={["All Suppliers", "Meralco", "XYZ Office Supplies"]}
          />
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Search
            </span>
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search bills or suppliers..."
              />
            </div>
          </label>
          <div className="flex items-end">
            <Button variant="outline" className="h-9 w-full">
              <Filter className="size-4" />
              Filters
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              asChild
              className="h-9 w-full bg-emerald-700 hover:bg-emerald-800"
            >
              <Link href="/accounting/accounts-payable/new">
                <Plus className="size-4" />
                New Bill
              </Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden py-0">
          <div className="border-b p-4">
            <h2 className="font-semibold">Bills / Payables</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No.</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount (₱)</TableHead>
                <TableHead className="text-right">Paid (₱)</TableHead>
                <TableHead className="text-right">Balance (₱)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payableBills.map((bill) => (
                <TableRow key={bill.billNo}>
                  <TableCell className="font-medium">{bill.billNo}</TableCell>
                  <TableCell>{bill.supplier}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        categoryStyle[bill.category],
                      )}
                    >
                      {bill.category}
                    </span>
                  </TableCell>
                  <TableCell>{bill.billDate}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell className="text-right font-medium">
                    {bill.amount}
                  </TableCell>
                  <TableCell className="text-right">{bill.paid}</TableCell>
                  <TableCell className="text-right font-medium">
                    {bill.balance}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusVariant[bill.status as keyof typeof statusVariant]
                      }
                      className="rounded-md"
                    >
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open bill actions</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Showing 1 to 6 of 32 entries</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm">
                <ChevronLeft className="size-4" />
              </Button>
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? "default" : "outline"}
                  size="icon-sm"
                  className={
                    page === 1 ? "bg-emerald-700 hover:bg-emerald-800" : ""
                  }
                >
                  {page}
                </Button>
              ))}
              <span className="px-2">...</span>
              <Button variant="outline" size="icon-sm">
                6
              </Button>
              <Button variant="outline" size="icon-sm">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
