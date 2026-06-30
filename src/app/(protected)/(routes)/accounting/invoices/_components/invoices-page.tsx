import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { InvoicePrintPreview } from "./invoice-print-preview";
import { invoices, invoiceSummaryCards, invoiceTabs } from "./invoices-data";

const toneStyles = {
  blue: "border-blue-100 bg-blue-50/45 text-blue-700",
  green: "border-emerald-100 bg-emerald-50/45 text-emerald-700",
  orange: "border-orange-100 bg-orange-50/45 text-orange-700",
  red: "border-red-100 bg-red-50/45 text-red-700",
  violet: "border-violet-100 bg-violet-50/45 text-violet-700",
};

const statusVariant = {
  Unpaid: "destructive",
  Partial: "info",
  Paid: "success",
  Overdue: "destructive",
} as const;

const agingStyle: Record<string, string> = {
  "0 - 30 Days": "bg-emerald-100 text-emerald-700",
  "31 - 60 Days": "bg-amber-100 text-amber-700",
  "61 - 90 Days": "bg-orange-100 text-orange-700",
  "Over 90 Days": "bg-red-100 text-red-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

function FilterSelect({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) {
  const defaultValue = options.includes(value) ? value : options[0];

  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select defaultValue={defaultValue}>
        <SelectTrigger className="h-9 w-full bg-background">
          <span className="min-w-0 truncate">{defaultValue}</span>
          <SelectValue placeholder={defaultValue} />
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

function SortableHead({ children }: { children: React.ReactNode }) {
  return (
    <TableHead>
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="size-3" />
      </span>
    </TableHead>
  );
}

export function InvoicesPage() {
  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage all customer invoices.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {invoiceSummaryCards.map((card) => {
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
                      "text-sm font-medium tracking-tight",
                      toneStyles[card.tone as keyof typeof toneStyles],
                      "border-0 bg-transparent p-0",
                    )}
                  >
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tightest">
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
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[170px_170px_150px_150px_1fr_auto_auto]">
          <FilterSelect
            label="Date Range"
            value="may"
            options={["May 1 - May 31, 2025", "This Week", "This Quarter"]}
          />
          <FilterSelect
            label="Customer"
            value="all"
            options={["All Customers", "St. Peter Parish", "Divine Word Publications"]}
          />
          <FilterSelect
            label="Status"
            value="all"
            options={["All Status", "Unpaid", "Partial", "Paid", "Overdue"]}
          />
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Search
            </span>
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search invoices..."
              />
            </div>
          </label>
          <div className="flex gap-3 items-end">
            <Button variant="outline" className="h-9">
              <Filter className="size-4" />
              Filters
            </Button>
            <Button className="h-9">
              <Plus className="size-4" />
              New Invoice
            </Button>
          </div>
        </div>

        <div className="flex gap-7 overflow-x-auto border-b px-4">
          {invoiceTabs.map((tab) => (
            <button
              key={tab.label}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 text-sm font-medium",
                tab.active
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {tab.label}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox aria-label="Select all invoices" />
              </TableHead>
              <SortableHead>Invoice No.</SortableHead>
              <TableHead>Customer</TableHead>
              <SortableHead>Invoice Date</SortableHead>
              <SortableHead>Due Date</SortableHead>
              <TableHead className="text-right">Amount (₱)</TableHead>
              <TableHead className="text-right">Paid (₱)</TableHead>
              <TableHead className="text-right">Balance (₱)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aging</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoiceNo}>
                <TableCell>
                  <Checkbox aria-label={`Select invoice ${invoice.invoiceNo}`} />
                </TableCell>
                <TableCell className="font-medium text-primary">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="font-medium text-primary hover:underline">
                        {invoice.invoiceNo}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[95vh] max-w-full! gap-0 overflow-hidden p-0">
                      <DialogHeader className="border-b px-5 py-4">
                        <DialogTitle>Print Invoice {invoice.invoiceNo}</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[calc(92vh-65px)] overflow-auto">
                        <InvoicePrintPreview invoice={invoice} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.invoiceDate}</TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell className="text-right font-medium">
                  {invoice.amount}
                </TableCell>
                <TableCell className="text-right">{invoice.paid}</TableCell>
                <TableCell className="text-right font-medium">
                  {invoice.balance}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusVariant[
                        invoice.status as keyof typeof statusVariant
                      ]
                    }
                    className="rounded-md"
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      agingStyle[invoice.aging],
                    )}
                  >
                    {invoice.aging}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open invoice actions</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Showing 1 to 10 of 48 entries</p>
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
              5
            </Button>
            <Button variant="outline" size="icon-sm">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
