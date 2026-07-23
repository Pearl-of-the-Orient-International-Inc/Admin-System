"use client";

import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
  useAccountsPayableQuery,
  useDeleteAccountPayableMutation,
  useRecordAccountPayablePaymentMutation,
} from "@/features/accounts-payable/accounts-payable.hooks";
import type {
  AccountingPayable,
  AccountingPayableStatus,
} from "@/features/accounts-payable/accounts-payable.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  style: "currency",
});

const statusVariant = {
  DRAFT: "secondary",
  OPEN: "secondary",
  DUE_SOON: "warning",
  OVERDUE: "error",
  PARTIAL: "info",
  PAID: "success",
  CANCELLED: "error",
} as const;

const statusLabels: Record<AccountingPayableStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  DUE_SOON: "Due Soon",
  OVERDUE: "Overdue",
  PARTIAL: "Partial",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

const toneStyles = {
  violet: "border-violet-100 bg-violet-50/45 text-violet-700",
  orange: "border-orange-100 bg-orange-50/45 text-orange-700",
  blue: "border-blue-100 bg-blue-50/45 text-blue-700",
  green: "border-emerald-100 bg-emerald-50/45 text-emerald-700",
};

const categoryPalette = [
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const amountOf = (value: string | number) => Number(value ?? 0);

const balanceOf = (payable: AccountingPayable) =>
  Math.max(amountOf(payable.totalAmount) - amountOf(payable.paidAmount), 0);

function DonutChart({
  segments,
}: {
  segments: { color: string; percent: number }[];
}) {
  const gradient = segments
    .reduce(
      (state, segment) => {
        const start = state.offset;
        const nextOffset = start + segment.percent;
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
      style={{
        background: gradient ? `conic-gradient(${gradient})` : "#e5e7eb",
      }}
    >
      <div className="m-auto flex size-20 translate-y-8 rounded-full bg-background" />
    </div>
  );
}

function PayablesTrendChart({
  trend,
}: {
  trend: { label: string; value: number }[];
}) {
  const width = 500;
  const height = 180;
  const padding = 24;
  const data = trend.length ? trend : [{ label: "No data", value: 0 }];
  const max = Math.max(...data.map((item) => item.value), 1);
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data
    .map((item, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (item.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-80 w-full">
      {[0, max / 2, max].map((tick) => {
        const y = height - padding - (tick / max) * (height - padding * 2);
        return (
          <g key={tick}>
            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" />
            <text x="0" y={y + 4} className="fill-muted-foreground text-[11px]">
              {currency.format(tick).replace("PHP", "₱")}
            </text>
          </g>
        );
      })}
      {data.map((item, index) => (
        <text
          key={`${item.label}-${index}`}
          x={padding + index * xStep}
          y={height - 3}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          {item.label}
        </text>
      ))}
      <polyline
        points={points}
        fill="none"
        stroke="#22c55e"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function AccountsPayablePage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AccountingPayableStatus>("all");
  const [category, setCategory] = useState("all");
  const [payablePendingDelete, setPayablePendingDelete] =
    useState<AccountingPayable | null>(null);
  const [payablePendingPayment, setPayablePendingPayment] =
    useState<AccountingPayable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const payablesQuery = useAccountsPayableQuery({
    category: category === "all" ? undefined : category,
    limit: 10,
    page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const deletePayableMutation = useDeleteAccountPayableMutation();
  const recordPaymentMutation = useRecordAccountPayablePaymentMutation();

  const payables = payablesQuery.data?.data ?? [];
  const summary = payablesQuery.data?.summary;
  const categories = useMemo(
    () =>
      Array.from(new Set((payablesQuery.data?.data ?? []).map((item) => item.category))),
    [payablesQuery.data?.data],
  );
  const summaryCards = [
    {
      icon: BriefcaseBusiness,
      subtitle: "Total outstanding balance",
      title: "Total Payables",
      tone: "violet",
      value: currency.format(summary?.cards.totalPayables ?? 0),
    },
    {
      icon: CalendarClock,
      subtitle: `${summary?.cards.dueThisWeekCount ?? 0} bills due`,
      title: "Due This Week",
      tone: "orange",
      value: currency.format(summary?.cards.dueThisWeek ?? 0),
    },
    {
      icon: FileText,
      subtitle: `${summary?.cards.dueThisMonthCount ?? 0} bills due`,
      title: "Due This Month",
      tone: "blue",
      value: currency.format(summary?.cards.dueThisMonth ?? 0),
    },
    {
      icon: CheckCircle2,
      subtitle: `${summary?.cards.paidThisMonthCount ?? 0} bills paid`,
      title: "Paid This Month",
      tone: "green",
      value: currency.format(summary?.cards.paidThisMonth ?? 0),
    },
  ];

  const onDelete = async () => {
    if (!payablePendingDelete) return;
    try {
      await deletePayableMutation.mutateAsync(payablePendingDelete.id);
      toast({
        title: "Bill deleted",
        description: payablePendingDelete.billNo,
      });
      setPayablePendingDelete(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const openPaymentDialog = (payable: AccountingPayable) => {
    setPayablePendingPayment(payable);
    setPaymentAmount(String(balanceOf(payable)));
  };

  const onRecordPayment = async () => {
    if (!payablePendingPayment) return;

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Invalid payment amount",
        description: "Enter an amount greater than zero.",
        variant: "error",
      });
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        amount,
        id: payablePendingPayment.id,
      });
      toast({
        title: "Payment recorded",
        description: payablePendingPayment.billNo,
      });
      setPayablePendingPayment(null);
      setPaymentAmount("");
    } catch (error) {
      toast({
        title: "Payment failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts Payable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track and manage all payables, bills, and vendor payments.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
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
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {payablesQuery.isLoading ? "Loading..." : card.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.subtitle}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden py-0">
        <div className="grid xl:grid-cols-[1.5fr_1fr_1fr]">
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Payables Trend</h2>
            <PayablesTrendChart trend={summary?.trend ?? []} />
          </section>
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Accounts Payable Aging</h2>
            <p className="mt-1 text-xs">
              Total:{" "}
              <span className="font-semibold text-emerald-700">
                {currency.format(summary?.cards.totalPayables ?? 0)}
              </span>
            </p>
            <div className="mt-5 grid gap-5">
              <DonutChart segments={summary?.aging ?? []} />
              <div className="space-y-3 text-xs">
                {(summary?.aging ?? []).map((segment) => (
                  <div key={segment.label} className="flex gap-2">
                    <span
                      className="mt-1 size-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p className="font-semibold">
                        {segment.label}
                        <span className="ml-1 text-muted-foreground">
                          ({segment.percent}%)
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {currency.format(segment.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="p-5">
            <h2 className="text-sm font-bold">Payables by Category</h2>
            <div className="mt-5 space-y-3 text-xs">
              {(summary?.categories ?? []).length ? (
                summary?.categories.map((segment, index) => (
                  <div key={segment.label} className="flex gap-2">
                    <span
                      className={cn(
                        "mt-1 size-3 rounded-full",
                        categoryPalette[index % categoryPalette.length],
                      )}
                    />
                    <div>
                      <p className="font-semibold">
                        {segment.label}
                        <span className="ml-1 text-muted-foreground">
                          ({segment.percent}%)
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {currency.format(segment.value)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No payable categories yet.</p>
              )}
            </div>
          </section>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[150px_180px_1fr_auto_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value as typeof status);
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <Select
              value={category}
              onValueChange={(value) => {
                setPage(1);
                setCategory(value);
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Search</span>
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search bills or suppliers..."
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </div>
          </label>
          <div className="flex items-end">
            <Button asChild className="h-9 w-full bg-emerald-700 hover:bg-emerald-800">
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
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payablesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    Loading payables...
                  </TableCell>
                </TableRow>
              ) : payables.length ? (
                payables.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">
                      <Link href={`/accounting/accounts-payable/${bill.id}`}>
                        {bill.billNo}
                      </Link>
                    </TableCell>
                    <TableCell>{bill.supplier}</TableCell>
                    <TableCell>
                      <span className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700">
                        {bill.category}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(bill.billDate)}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.format(amountOf(bill.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right">
                      {currency.format(amountOf(bill.paidAmount))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.format(balanceOf(bill))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[bill.status]} className="rounded-md">
                        {statusLabels[bill.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="ml-auto flex">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open bill actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/accounting/accounts-payable/${bill.id}`}>
                              <Pencil className="size-4" />
                              Edit bill
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPaymentDialog(bill)}>
                            <WalletCards className="size-4" />
                            Record payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => setPayablePendingDelete(bill)}
                          >
                            <Trash2 className="size-4" />
                            Delete bill
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    No payables found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {payables.length ? (page - 1) * 10 + 1 : 0} to{" "}
              {(page - 1) * 10 + payables.length} of {payablesQuery.data?.meta.total ?? 0} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button className="bg-emerald-700 hover:bg-emerald-800" size="icon-sm">
                {page}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= (payablesQuery.data?.meta.totalPages ?? 1)}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Dialog
        open={Boolean(payablePendingPayment)}
        onOpenChange={(open) => {
          if (!open) {
            setPayablePendingPayment(null);
            setPaymentAmount("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Apply payment to {payablePendingPayment?.billNo}. Balance:{" "}
              {payablePendingPayment
                ? currency.format(balanceOf(payablePendingPayment))
                : currency.format(0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="payment-amount">
              Payment Amount
            </label>
            <Input
              id="payment-amount"
              min="0.01"
              step="0.01"
              type="number"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPayablePendingPayment(null);
                setPaymentAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={recordPaymentMutation.isPending}
              onClick={onRecordPayment}
            >
              {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(payablePendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPayablePendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {payablePendingDelete?.billNo}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePayableMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deletePayableMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void onDelete();
              }}
            >
              {deletePayableMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
