"use client";

import {
  ArrowDownLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useCreateLedgerTransactionMutation,
  useDeleteLedgerTransactionMutation,
  useLedgerTransactionsQuery,
  useUpdateLedgerTransactionMutation,
} from "@/features/cashflow-ledger/cashflow-ledger.hooks";
import type {
  LedgerTransaction,
  LedgerTransactionStatus,
  LedgerTransactionType,
} from "@/features/cashflow-ledger/cashflow-ledger.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

type TransactionForm = {
  account: string;
  accountNo: string;
  amount: string;
  category: string;
  note: string;
  party: string;
  reference: string;
  status: LedgerTransactionStatus;
  transactionDate: string;
  type: LedgerTransactionType;
};

const currency = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  style: "currency",
});
const todayInputValue = () => new Date().toISOString().slice(0, 10);
const defaultForm = (): TransactionForm => ({
  account: "Cash in Bank - BPI",
  accountNo: "",
  amount: "0",
  category: "",
  note: "",
  party: "",
  reference: "",
  status: "PAID",
  transactionDate: todayInputValue(),
  type: "INCOME",
});
const formFromTransaction = (
  transaction: LedgerTransaction,
): TransactionForm => {
  const debit = amountOf(transaction.debit);
  const credit = amountOf(transaction.credit);
  return {
    account: transaction.account,
    accountNo: transaction.accountNo ?? "",
    amount: String(debit || credit || 0),
    category: transaction.category,
    note: transaction.note ?? "",
    party: transaction.party,
    reference: transaction.reference ?? "",
    status: transaction.status,
    transactionDate: transaction.transactionDate.slice(0, 10),
    type: transaction.type,
  };
};

const toneStyles = {
  blue: {
    card: "border-blue-100 bg-blue-50/35",
    icon: "bg-blue-100 text-blue-700",
    label: "text-blue-700",
  },
  emerald: {
    card: "border-emerald-100 bg-emerald-50/35",
    icon: "bg-emerald-100 text-emerald-700",
    label: "text-emerald-700",
  },
  orange: {
    card: "border-orange-100 bg-orange-50/35",
    icon: "bg-orange-100 text-orange-700",
    label: "text-orange-700",
  },
  violet: {
    card: "border-violet-100 bg-violet-50/35",
    icon: "bg-violet-100 text-violet-700",
    label: "text-violet-700",
  },
} as const;

const typeLabels: Record<LedgerTransactionType, string> = {
  EXPENSE: "Expense",
  INCOME: "Income",
  PAYABLE: "Payable",
  RECEIVABLE: "Receivable",
};
const statusLabels: Record<LedgerTransactionStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  RECEIVED: "Received",
  UNPAID: "Unpaid",
  VOID: "Void",
};
const typeVariant = {
  EXPENSE: "error",
  INCOME: "success",
  PAYABLE: "info",
  RECEIVABLE: "info",
} as const;
const statusVariant = {
  PAID: "success",
  PENDING: "warning",
  RECEIVED: "info",
  UNPAID: "warning",
  VOID: "error",
} as const;

const categoryClassName: Record<string, string> = {
  Books: "bg-blue-100 text-blue-700",
  Donations: "bg-green-100 text-green-700",
  "Enrollment Fees": "bg-emerald-100 text-emerald-700",
  Supplies: "bg-orange-100 text-orange-700",
  "Tuition Fees": "bg-emerald-100 text-emerald-700",
  Utilities: "bg-amber-100 text-amber-700",
};

const amountOf = (value: string | number) => Number(value ?? 0);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

function CashflowLineChart({
  trend,
}: {
  trend: { expenses: number; label: string; revenue: number }[];
}) {
  const width = 620;
  const height = 180;
  const padding = 22;
  const data = trend.length
    ? trend
    : [{ expenses: 0, label: "No data", revenue: 0 }];
  const max = Math.max(
    ...data.flatMap((item) => [item.revenue, item.expenses]),
    1,
  );
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const toPoint = (value: number, index: number) =>
    `${padding + index * xStep},${height - padding - (value / max) * (height - padding * 2)}`;
  const revenuePoints = data
    .map((item, index) => toPoint(item.revenue, index))
    .join(" ");
  const expensePoints = data
    .map((item, index) => toPoint(item.expenses, index))
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-80 w-full">
        {[0, max / 2, max].map((tick) => {
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
                {currency.format(tick)}
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
          points={revenuePoints}
          fill="none"
          stroke="#22c55e"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <polyline
          points={expensePoints}
          fill="none"
          stroke="#f97316"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
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
  segments,
  title,
  total,
}: {
  segments: { color: string; label: string; percent: number; value: number }[];
  title: string;
  total: number;
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
    <Card className="rounded-none border-0 border-l py-0 shadow-none first:border-l-0">
      <CardHeader className="px-5 pt-5 pb-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <p className="text-xs">
          Total:{" "}
          <span className="font-semibold text-emerald-700">
            {currency.format(total)}
          </span>
        </p>
      </CardHeader>
      <CardContent className="grid gap-5 px-5 py-5">
        <div
          className="mx-auto size-30 rounded-full"
          style={{
            background: gradient ? `conic-gradient(${gradient})` : "#e5e7eb",
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
      </CardContent>
    </Card>
  );
}

export function CashflowLedgerPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | LedgerTransactionType>("all");
  const [status, setStatus] = useState<"all" | LedgerTransactionStatus>("all");
  const [account, setAccount] = useState("all");
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactionPendingEdit, setTransactionPendingEdit] =
    useState<LedgerTransaction | null>(null);
  const [form, setForm] = useState<TransactionForm>(defaultForm());
  const [transactionPendingDelete, setTransactionPendingDelete] =
    useState<LedgerTransaction | null>(null);
  const ledgerQuery = useLedgerTransactionsQuery({
    account: account === "all" ? undefined : account,
    limit: 10,
    page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
  });
  const createMutation = useCreateLedgerTransactionMutation();
  const updateMutation = useUpdateLedgerTransactionMutation();
  const deleteMutation = useDeleteLedgerTransactionMutation();
  const transactions = ledgerQuery.data?.data ?? [];
  const summary = ledgerQuery.data?.summary;
  const accounts = useMemo(
    () =>
      Array.from(
        new Set((ledgerQuery.data?.data ?? []).map((item) => item.account)),
      ),
    [ledgerQuery.data?.data],
  );
  const summaryCards = [
    {
      icon: WalletCards,
      subtitle: "Available Balance",
      title: "Total Cash Balance",
      tone: "emerald",
      value: currency.format(summary?.cards.cashBalance ?? 0),
    },
    {
      icon: BarChart3,
      subtitle: "Income Received",
      title: "Total Revenue",
      tone: "blue",
      value: currency.format(summary?.cards.revenue ?? 0),
    },
    {
      icon: ArrowDownLeft,
      subtitle: "Total Payments Made",
      title: "Total Expenses",
      tone: "orange",
      value: currency.format(summary?.cards.expenses ?? 0),
    },
    {
      icon: BarChart3,
      subtitle: "Revenue - Expenses",
      title: "Net Cashflow",
      tone: "violet",
      value: currency.format(summary?.cards.netCashflow ?? 0),
    },
  ];

  const updateForm = (field: keyof TransactionForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openNewTransaction = () => {
    setTransactionPendingEdit(null);
    setForm(defaultForm());
    setNewTransactionOpen(true);
  };

  const openEditTransaction = (transaction: LedgerTransaction) => {
    setTransactionPendingEdit(transaction);
    setForm(formFromTransaction(transaction));
    setNewTransactionOpen(true);
  };

  const saveTransaction = async () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter amount greater than zero.",
        variant: "error",
      });
      return;
    }
    try {
      const isDebit = form.type === "EXPENSE";
      const payload = {
        account: form.account,
        accountNo: form.accountNo,
        category: form.category,
        credit: isDebit ? 0 : amount,
        debit: isDebit ? amount : 0,
        note: form.note,
        party: form.party,
        reference: form.reference,
        status: form.status,
        transactionDate: form.transactionDate,
        type: form.type,
      };
      if (transactionPendingEdit) {
        await updateMutation.mutateAsync({
          id: transactionPendingEdit.id,
          payload,
        });
        toast({ title: "Transaction updated" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Transaction created" });
      }
      setNewTransactionOpen(false);
      setTransactionPendingEdit(null);
      setForm(defaultForm());
    } catch (error) {
      toast({
        title: "Save failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const deleteTransaction = async () => {
    if (!transactionPendingDelete) return;
    try {
      await deleteMutation.mutateAsync(transactionPendingDelete.id);
      toast({
        title: "Transaction deleted",
        description: transactionPendingDelete.transactionNo,
      });
      setTransactionPendingDelete(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Cashflow / Ledger</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track cash flow, revenue, expenses, accounts receivable and payable.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const tone = toneStyles[card.tone as keyof typeof toneStyles];
          return (
            <Card key={card.title} className={cn("gap-0 p-5", tone.card)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium tracking-tight",
                      tone.label,
                    )}
                  >
                    {card.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {ledgerQuery.isLoading ? "Loading..." : card.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
                <span className={cn("rounded-md p-2", tone.icon)}>
                  <Icon className="size-5" />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden py-0">
        <div className="grid xl:grid-cols-[1.5fr_1fr_1fr]">
          <section className="border-b p-5 xl:border-r xl:border-b-0">
            <h2 className="text-sm font-bold">Cashflow Overview</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Revenue vs Expenses
            </p>
            <CashflowLineChart trend={summary?.trend ?? []} />
          </section>
          <AgingDonut
            title="Accounts Receivable Aging"
            total={summary?.receivableAging.total ?? 0}
            segments={summary?.receivableAging.segments ?? []}
          />
          <AgingDonut
            title="Accounts Payable Aging"
            total={summary?.payableAging.total ?? 0}
            segments={summary?.payableAging.segments ?? []}
          />
        </div>
      </Card>

      <section className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[150px_160px_150px_1fr_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Transaction Type
            </span>
            <Select
              value={type}
              onValueChange={(value) => {
                setPage(1);
                setType(value as typeof type);
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Account Type
            </span>
            <Select
              value={account}
              onValueChange={(value) => {
                setPage(1);
                setAccount(value);
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
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
            <span className="text-xs font-medium text-muted-foreground">
              Search
            </span>
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search description, reference, or party..."
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </div>
          </label>
          <div className="flex items-end">
            <Button
              className="h-9 w-full bg-emerald-700 hover:bg-emerald-800"
              onClick={openNewTransaction}
            >
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
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <p className="font-medium">
                        {formatDate(transaction.transactionDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.transactionNo}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={typeVariant[transaction.type]}
                        className="rounded-md"
                      >
                        {typeLabels[transaction.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{transaction.party}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.note ?? transaction.reference ?? "No note"}
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
                          categoryClassName[transaction.category] ??
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {amountOf(transaction.debit)
                        ? currency.format(amountOf(transaction.debit))
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {amountOf(transaction.credit)
                        ? currency.format(amountOf(transaction.credit))
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      -
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[transaction.status]}
                        className="rounded-md"
                      >
                        {statusLabels[transaction.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">
                              Open transaction actions
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditTransaction(transaction)}
                          >
                            <Pencil className="size-4" />
                            Edit transaction
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() =>
                              setTransactionPendingDelete(transaction)
                            }
                          >
                            <Trash2 className="size-4" />
                            Delete transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {transactions.length ? (page - 1) * 10 + 1 : 0} to{" "}
              {(page - 1) * 10 + transactions.length} of{" "}
              {ledgerQuery.data?.meta.total ?? 0} entries
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
              <Button
                className="bg-emerald-700 hover:bg-emerald-800"
                size="icon-sm"
              >
                {page}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= (ledgerQuery.data?.meta.totalPages ?? 1)}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Dialog
        open={newTransactionOpen}
        onOpenChange={(open) => {
          setNewTransactionOpen(open);
          if (!open) {
            setTransactionPendingEdit(null);
            setForm(defaultForm());
          }
        }}
      >
        <DialogContent className="max-w-2xl!">
          <DialogHeader>
            <DialogTitle>
              {transactionPendingEdit ? "Edit Transaction" : "New Transaction"}
            </DialogTitle>
            <DialogDescription>
              {transactionPendingEdit
                ? `Update ${transactionPendingEdit.transactionNo}.`
                : "Record cash inflow, cash outflow, payable, or receivable movement."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium">Date</span>
              <Input
                type="date"
                value={form.transactionDate}
                onChange={(event) =>
                  updateForm("transactionDate", event.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Type</span>
              <Select
                value={form.type}
                onValueChange={(value) => updateForm("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Party / Description</span>
              <Input
                value={form.party}
                onChange={(event) => updateForm("party", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Category</span>
              <Input
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Account</span>
              <Input
                value={form.account}
                onChange={(event) => updateForm("account", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Account No.</span>
              <Input
                value={form.accountNo}
                onChange={(event) =>
                  updateForm("accountNo", event.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Amount</span>
              <Input
                min="0.01"
                step="0.01"
                type="number"
                value={form.amount}
                onChange={(event) => updateForm("amount", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Status</span>
              <Select
                value={form.status}
                onValueChange={(value) => updateForm("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Reference</span>
              <Input
                value={form.reference}
                onChange={(event) =>
                  updateForm("reference", event.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Note</span>
              <Input
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewTransactionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={saveTransaction}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : transactionPendingEdit
                  ? "Update Transaction"
                  : "Create Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(transactionPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setTransactionPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {transactionPendingDelete?.transactionNo}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteTransaction();
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
