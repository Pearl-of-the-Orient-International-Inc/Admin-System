"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
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
  useAccountsReceivableQuery,
  useDeleteAccountReceivableMutation,
  useRecordAccountReceivablePaymentMutation,
} from "@/features/accounts-receivable/accounts-receivable.hooks";
import type {
  AccountingReceivable,
  AccountingReceivableStatus,
} from "@/features/accounts-receivable/accounts-receivable.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-PH", { currency: "PHP", style: "currency" });

const statusVariant = {
  CANCELLED: "error",
  DRAFT: "secondary",
  OVERDUE: "error",
  PAID: "success",
  PARTIAL: "info",
  UNPAID: "warning",
} as const;

const statusLabels: Record<AccountingReceivableStatus, string> = {
  CANCELLED: "Cancelled",
  DRAFT: "Draft",
  OVERDUE: "Overdue",
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
};

const toneStyles = {
  amber: "border-amber-100 bg-amber-50/45 text-amber-700",
  blue: "border-blue-100 bg-blue-50/45 text-blue-700",
  green: "border-emerald-100 bg-emerald-50/45 text-emerald-700",
  red: "border-red-100 bg-red-50/45 text-red-700",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const amountOf = (value: string | number) => Number(value ?? 0);
const balanceOf = (receivable: AccountingReceivable) =>
  Math.max(amountOf(receivable.totalAmount) - amountOf(receivable.paidAmount), 0);

const agingLabel = (invoiceDate: string) => {
  const ageDays = Math.max(Math.floor((Date.now() - new Date(invoiceDate).getTime()) / 86_400_000), 0);
  if (ageDays > 90) return "Over 90 Days";
  if (ageDays > 60) return "61 - 90 Days";
  if (ageDays > 30) return "31 - 60 Days";
  return "0 - 30 Days";
};

const agingStyle: Record<string, string> = {
  "0 - 30 Days": "bg-emerald-100 text-emerald-700",
  "31 - 60 Days": "bg-amber-100 text-amber-700",
  "61 - 90 Days": "bg-orange-100 text-orange-700",
  "Over 90 Days": "bg-red-100 text-red-700",
};

function DonutChart({ segments }: { segments: { color: string; percent: number }[] }) {
  const gradient = segments
    .reduce(
      (state, segment) => {
        const start = state.offset;
        const nextOffset = start + segment.percent;
        return { offset: nextOffset, stops: [...state.stops, `${segment.color} ${start}% ${nextOffset}%`] };
      },
      { offset: 0, stops: [] as string[] },
    )
    .stops.join(", ");
  return (
    <div className="size-36 rounded-full" style={{ background: gradient ? `conic-gradient(${gradient})` : "#e5e7eb" }}>
      <div className="m-auto flex size-20 translate-y-8 rounded-full bg-background" />
    </div>
  );
}

function ReceivableTrendChart({ trend }: { trend: { label: string; value: number }[] }) {
  const width = 520;
  const height = 180;
  const padding = 24;
  const data = trend.length ? trend : [{ label: "No data", value: 0 }];
  const max = Math.max(...data.map((item) => item.value), 1);
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data
    .map((item, index) => `${padding + index * xStep},${height - padding - (item.value / max) * (height - padding * 2)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-50 w-full">
      {[0, max / 2, max].map((tick) => {
        const y = height - padding - (tick / max) * (height - padding * 2);
        return (
          <g key={tick}>
            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" />
            <text x="0" y={y + 4} className="fill-muted-foreground text-[11px]">
              {currency.format(tick)}
            </text>
          </g>
        );
      })}
      {data.map((item, index) => (
        <text key={`${item.label}-${index}`} x={padding + index * xStep} y={height - 3} textAnchor="middle" className="fill-muted-foreground text-[11px]">
          {item.label}
        </text>
      ))}
      <polyline points={points} fill="none" stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

export function AccountsReceivablePage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AccountingReceivableStatus>("all");
  const [customer, setCustomer] = useState("all");
  const [receivablePendingDelete, setReceivablePendingDelete] = useState<AccountingReceivable | null>(null);
  const [receivablePendingPayment, setReceivablePendingPayment] = useState<AccountingReceivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const receivablesQuery = useAccountsReceivableQuery({
    customer: customer === "all" ? undefined : customer,
    limit: 10,
    page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const deleteMutation = useDeleteAccountReceivableMutation();
  const paymentMutation = useRecordAccountReceivablePaymentMutation();
  const receivables = receivablesQuery.data?.data ?? [];
  const summary = receivablesQuery.data?.summary;
  const customers = useMemo(
    () => Array.from(new Set((receivablesQuery.data?.data ?? []).map((item) => item.customer))),
    [receivablesQuery.data?.data],
  );
  const cards = [
    { icon: Banknote, title: "Total Receivables", value: currency.format(summary?.cards.totalReceivables ?? 0), subtitle: "Outstanding balance", tone: "blue" },
    { icon: Clock, title: "Overdue", value: currency.format(summary?.cards.overdue ?? 0), subtitle: `${summary?.cards.overdueCount ?? 0} invoices`, tone: "red" },
    { icon: CheckCircle2, title: "Collected This Month", value: currency.format(summary?.cards.collectedThisMonth ?? 0), subtitle: `${summary?.cards.collectedThisMonthCount ?? 0} invoices`, tone: "green" },
    { icon: FileText, title: "Invoices", value: String(summary?.cards.invoices ?? 0), subtitle: "Active invoices", tone: "amber" },
  ];

  const onDelete = async () => {
    if (!receivablePendingDelete) return;
    try {
      await deleteMutation.mutateAsync(receivablePendingDelete.id);
      toast({ title: "Invoice deleted", description: receivablePendingDelete.invoiceNo });
      setReceivablePendingDelete(null);
    } catch (error) {
      toast({ title: "Delete failed", description: toApiError(error).message, variant: "error" });
    }
  };

  const openPaymentDialog = (receivable: AccountingReceivable) => {
    setReceivablePendingPayment(receivable);
    setPaymentAmount(String(balanceOf(receivable)));
  };

  const onRecordPayment = async () => {
    if (!receivablePendingPayment) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Invalid payment amount", description: "Enter amount greater than zero.", variant: "error" });
      return;
    }
    try {
      await paymentMutation.mutateAsync({ amount, id: receivablePendingPayment.id });
      toast({ title: "Payment recorded", description: receivablePendingPayment.invoiceNo });
      setReceivablePendingPayment(null);
      setPaymentAmount("");
    } catch (error) {
      toast({ title: "Payment failed", description: toApiError(error).message, variant: "error" });
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Accounts Receivable</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track customer invoices, collections, and outstanding balances.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="gap-0 p-5">
              <div className="flex items-start gap-4">
                <span className={cn("rounded-md border p-3", toneStyles[card.tone as keyof typeof toneStyles])}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{receivablesQuery.isLoading ? "Loading..." : card.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.subtitle}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden py-0">
        <div className="grid xl:grid-cols-3">
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Accounts Receivable Aging</h2>
            <p className="mt-1 text-xs">Total: <span className="font-semibold text-emerald-700">{currency.format(summary?.cards.totalReceivables ?? 0)}</span></p>
            <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
              <DonutChart segments={summary?.aging ?? []} />
              <div className="space-y-3 text-xs">
                {(summary?.aging ?? []).map((segment) => (
                  <div key={segment.label} className="flex gap-2">
                    <span className="mt-1 size-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <div>
                      <p className="font-semibold">{segment.label}<span className="ml-1 text-muted-foreground">({segment.percent}%)</span></p>
                      <p className="text-muted-foreground">{currency.format(segment.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Receivables Trend</h2>
            <ReceivableTrendChart trend={summary?.trend ?? []} />
          </section>
          <section className="p-5">
            <h2 className="text-sm font-bold">Top Outstanding Customers</h2>
            <div className="mt-4 overflow-hidden rounded-md border">
              {(summary?.topCustomers ?? []).length ? (
                summary?.topCustomers.map((item, index) => (
                  <div key={item.name} className="grid grid-cols-[36px_1fr_auto] border-b px-3 py-3 text-sm last:border-b-0">
                    <span className="text-muted-foreground">{index + 1}</span>
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold">{currency.format(item.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="p-3 text-sm text-muted-foreground">No receivables yet.</p>
              )}
            </div>
          </section>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[170px_170px_1fr_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Customer</span>
            <Select value={customer} onValueChange={(value) => { setPage(1); setCustomer(value); }}>
              <SelectTrigger className="h-9 w-full bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value as typeof status); }}>
              <SelectTrigger className="h-9 w-full bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Search</span>
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search invoices or customers..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
            </div>
          </label>
          <div className="flex items-end">
            <Button asChild className="h-9 w-full bg-emerald-700 hover:bg-emerald-800">
              <Link href="/accounting/accounts-receivable/new"><Plus className="size-4" />New Invoice</Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden py-0">
          <div className="border-b p-4"><h2 className="font-semibold">Invoices / Receivables</h2></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Balance</TableHead>
                <TableHead>Aging</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivablesQuery.isLoading ? (
                <TableRow><TableCell colSpan={10} className="py-10 text-center text-muted-foreground">Loading receivables...</TableCell></TableRow>
              ) : receivables.length ? receivables.map((invoice) => {
                const aging = agingLabel(invoice.invoiceDate);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium"><Link href={`/accounting/accounts-receivable/${invoice.id}`}>{invoice.invoiceNo}</Link></TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">{currency.format(amountOf(invoice.totalAmount))}</TableCell>
                    <TableCell className="text-right">{currency.format(amountOf(invoice.paidAmount))}</TableCell>
                    <TableCell className="text-right font-medium">{currency.format(balanceOf(invoice))}</TableCell>
                    <TableCell><span className={cn("rounded-md px-2 py-1 text-xs font-medium", agingStyle[aging])}>{aging}</span></TableCell>
                    <TableCell><Badge variant={statusVariant[invoice.status]} className="rounded-md">{statusLabels[invoice.status]}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="ml-auto flex"><MoreHorizontal className="size-4" /><span className="sr-only">Open invoice actions</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild><Link href={`/accounting/accounts-receivable/${invoice.id}`}><Pencil className="size-4" />Edit invoice</Link></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPaymentDialog(invoice)}><WalletCards className="size-4" />Record payment</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => setReceivablePendingDelete(invoice)}><Trash2 className="size-4" />Delete invoice</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={10} className="py-10 text-center text-muted-foreground">No receivables found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {receivables.length ? (page - 1) * 10 + 1 : 0} to {(page - 1) * 10 + receivables.length} of {receivablesQuery.data?.meta.total ?? 0} entries</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}><ChevronLeft className="size-4" /></Button>
              <Button className="bg-emerald-700 hover:bg-emerald-800" size="icon-sm">{page}</Button>
              <Button variant="outline" size="icon-sm" disabled={page >= (receivablesQuery.data?.meta.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </Card>
      </section>

      <Dialog open={Boolean(receivablePendingPayment)} onOpenChange={(open) => { if (!open) { setReceivablePendingPayment(null); setPaymentAmount(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Apply payment to {receivablePendingPayment?.invoiceNo}. Balance: {receivablePendingPayment ? currency.format(balanceOf(receivablePendingPayment)) : currency.format(0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="receivable-payment-amount">Payment Amount</label>
            <Input id="receivable-payment-amount" min="0.01" step="0.01" type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReceivablePendingPayment(null); setPaymentAmount(""); }}>Cancel</Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800" disabled={paymentMutation.isPending} onClick={onRecordPayment}>{paymentMutation.isPending ? "Recording..." : "Record Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(receivablePendingDelete)} onOpenChange={(open) => { if (!open) setReceivablePendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete {receivablePendingDelete?.invoiceNo}. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" disabled={deleteMutation.isPending} onClick={(event) => { event.preventDefault(); void onDelete(); }}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
