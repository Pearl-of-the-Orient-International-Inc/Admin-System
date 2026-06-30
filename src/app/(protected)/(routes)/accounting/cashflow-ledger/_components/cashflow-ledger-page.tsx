import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  cashflowTrend,
  payableAging,
  receivableAging,
  summaryCards,
  transactions,
} from "./cashflow-ledger-data";

const toneStyles = {
  emerald: {
    card: "border-emerald-100 bg-emerald-50/35",
    label: "text-emerald-700",
    icon: "bg-emerald-100 text-emerald-700",
  },
  blue: {
    card: "border-blue-100 bg-blue-50/35",
    label: "text-blue-700",
    icon: "bg-blue-100 text-blue-700",
  },
  orange: {
    card: "border-orange-100 bg-orange-50/35",
    label: "text-orange-700",
    icon: "bg-orange-100 text-orange-700",
  },
  violet: {
    card: "border-violet-100 bg-violet-50/35",
    label: "text-violet-700",
    icon: "bg-violet-100 text-violet-700",
  },
} as const;

const typeVariant = {
  Income: "success",
  Expense: "error",
  Payable: "info",
  Receivable: "info",
} as const;

const statusVariant = {
  Paid: "success",
  Received: "info",
  Unpaid: "warning",
} as const;

const categoryClassName: Record<string, string> = {
  "Tuition Fees": "bg-emerald-100 text-emerald-700",
  Supplies: "bg-orange-100 text-orange-700",
  Donations: "bg-green-100 text-green-700",
  Utilities: "bg-amber-100 text-amber-700",
  Books: "bg-blue-100 text-blue-700",
  "Enrollment Fees": "bg-emerald-100 text-emerald-700",
};

function CashflowLineChart() {
  const width = 620;
  const height = 180;
  const padding = 22;
  const max = 220000;
  const xStep = (width - padding * 2) / (cashflowTrend.length - 1);

  const toPoint = (value: number, index: number) => {
    const x = padding + index * xStep;
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  };

  const revenuePoints = cashflowTrend
    .map((item, index) => toPoint(item.revenue, index))
    .join(" ");
  const expensePoints = cashflowTrend
    .map((item, index) => toPoint(item.expenses, index))
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-80 w-full">
        {[0, 50000, 100000, 150000, 200000].map((tick) => {
          const y = height - padding - (tick / max) * (height - padding * 2);
          return (
            <g key={tick}>
              <line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text x="0" y={y + 4} className="fill-muted-foreground text-[11px]">
                ₱ {tick === 0 ? "0" : `${tick / 1000}K`}
              </text>
            </g>
          );
        })}
        {cashflowTrend.map((item, index) =>
          item.label ? (
            <text
              key={item.label}
              x={padding + index * xStep}
              y={height - 3}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {item.label}
            </text>
          ) : null,
        )}
        <polyline
          points={revenuePoints}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={expensePoints}
          fill="none"
          stroke="#f97316"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-center gap-5 text-xs">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-green-500" />
          Revenue
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-orange-500" />
          Expenses
        </span>
      </div>
    </div>
  );
}

function AgingDonut({
  title,
  total,
  segments,
}: {
  title: string;
  total: string;
  segments: typeof receivableAging.segments;
}) {
  const gradient = segments
    .reduce(
      (state, segment) => {
        const start = state.offset;
        const nextOffset = start + segment.amount;

        return {
          offset: nextOffset,
          stops: [
            ...state.stops,
            `${segment.color} ${start}% ${nextOffset}%`,
          ],
        };
      },
      { offset: 0, stops: [] as string[] },
    )
    .stops.join(", ");

  return (
    <Card className="rounded-none border-0 border-l py-0 shadow-none first:border-l-0">
      <CardHeader className="px-5 pt-5 pb-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <p className="text-xs">
          Total: <span className="font-semibold text-emerald-700">{total}</span>
        </p>
      </CardHeader>
      <CardContent className="grid gap-5 px-5 py-5">
        <div
          className="mx-auto size-30 rounded-full"
          style={{
            background: `conic-gradient(${gradient})`,
          }}
        >
          <div className="m-auto flex size-18 translate-y-7 rounded-full bg-background" />
        </div>
        <div className="space-y-3 text-xs">
          {segments.map((segment) => (
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
      </CardContent>
    </Card>
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

export function CashflowLedgerPage() {
  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cashflow / Ledger
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track cash flow, revenue, expenses, accounts receivable and payable.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const tone = toneStyles[card.tone as keyof typeof toneStyles];

          return (
            <Card key={card.title} className={cn("gap-0 p-5", tone.card)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("text-sm tracking-tighter font-medium", tone.label)}>
                    {card.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tighter">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
                <span className={cn("rounded-md p-2", tone.icon)}>
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-xs text-green-700">↑ {card.trend}</p>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden py-0">
        <div className="grid xl:grid-cols-[1.50fr_1fr_1fr]">
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold">Cashflow Overview</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Revenue vs Expenses
                </p>
              </div>
              <Select defaultValue="month">
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CashflowLineChart />
          </section>
          <AgingDonut
            title="Accounts Receivable Aging"
            total={receivableAging.total}
            segments={receivableAging.segments}
          />
          <AgingDonut
            title="Accounts Payable Aging"
            total={payableAging.total}
            segments={payableAging.segments}
          />
        </div>
      </Card>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[160px_150px_160px_150px_1fr_auto_auto]">
          <FilterSelect
            label="Date Range"
            value="may"
            options={["May 1 - May 31, 2025", "This Week", "This Quarter"]}
          />
          <FilterSelect
            label="Transaction Type"
            value="all"
            options={["All Types", "Income", "Expense", "Payable", "Receivable"]}
          />
          <FilterSelect
            label="Account Type"
            value="all"
            options={["All Accounts", "Cash in Bank", "Cash on Hand", "AR/AP"]}
          />
          <FilterSelect
            label="Status"
            value="all"
            options={["All Status", "Paid", "Received", "Unpaid"]}
          />
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Search
            </span>
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search description, reference, or party..."
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
            <Button className="h-9 w-full bg-emerald-700 hover:bg-emerald-800">
              <Plus className="size-4" />
              New Transaction
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden py-0">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Transactions</h2>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description / Party</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Debit (₱)</TableHead>
                <TableHead className="text-right">Credit (₱)</TableHead>
                <TableHead className="text-right">Balance (₱)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.reference}>
                  <TableCell>
                    <p className="font-medium">{transaction.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.time}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        typeVariant[
                          transaction.type as keyof typeof typeVariant
                        ]
                      }
                      className="rounded-md"
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{transaction.party}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.note}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{transaction.account}</p>
                    {transaction.accountNo ? (
                      <p className="text-xs text-muted-foreground">
                        {transaction.accountNo}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        categoryClassName[transaction.category],
                      )}
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {transaction.debit}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {transaction.credit}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {transaction.balance}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusVariant[
                          transaction.status as keyof typeof statusVariant
                        ]
                      }
                      className="rounded-md"
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Open transaction actions</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Showing 1 to 6 of 56 entries</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm">
                <ChevronLeft className="size-4" />
              </Button>
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? "default" : "outline"}
                  size="icon-sm"
                  className={page === 1 ? "bg-emerald-700 hover:bg-emerald-800" : ""}
                >
                  {page}
                </Button>
              ))}
              <span className="px-2">...</span>
              <Button variant="outline" size="icon-sm">
                10
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
