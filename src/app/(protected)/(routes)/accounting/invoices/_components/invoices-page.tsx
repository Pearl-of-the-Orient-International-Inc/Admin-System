"use client";

import {
  AlertCircle,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  Send,
  Trash2,
  WalletCards,
  X,
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
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useInvoicesQuery,
  useUpdateInvoiceStatusMutation,
} from "@/features/invoices/invoices.hooks";
import type {
  Invoice,
  InvoicePayloadItem,
  InvoiceStatus,
} from "@/features/invoices/invoices.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

import { InvoicePrintPreview } from "./invoice-print-preview";

type InvoiceForm = {
  bankAccount: string;
  customer: string;
  description: string;
  discount: string;
  dueDate: string;
  invoiceDate: string;
  items: InvoicePayloadItem[];
  notes: string;
  paymentMethod: string;
  paymentTerms: string;
  reference: string;
  status: InvoiceStatus;
  tax: string;
};

const currency = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  style: "currency",
});
const todayInputValue = () => new Date().toISOString().slice(0, 10);
const amountOf = (value: string | number | null | undefined) =>
  Number(value ?? 0);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const balanceOf = (invoice: Invoice) =>
  Math.max(amountOf(invoice.totalAmount) - amountOf(invoice.paidAmount), 0);
const defaultForm = (): InvoiceForm => ({
  bankAccount: "",
  customer: "",
  description: "",
  discount: "0",
  dueDate: todayInputValue(),
  invoiceDate: todayInputValue(),
  items: [{ account: "", description: "", quantity: 1, unitPrice: 0 }],
  notes: "",
  paymentMethod: "",
  paymentTerms: "Due on receipt",
  reference: "",
  status: "UNPAID",
  tax: "0",
});

const toneStyles = {
  blue: "border-blue-100 bg-blue-50/45 text-blue-700",
  green: "border-emerald-100 bg-emerald-50/45 text-emerald-700",
  orange: "border-orange-100 bg-orange-50/45 text-orange-700",
  red: "border-red-100 bg-red-50/45 text-red-700",
};
const statusLabels: Record<InvoiceStatus, string> = {
  CANCELLED: "Cancelled",
  DRAFT: "Draft",
  OVERDUE: "Overdue",
  PAID: "Paid",
  PARTIAL: "Partially Paid",
  UNPAID: "Unpaid",
};
const statusVariant = {
  CANCELLED: "error",
  DRAFT: "secondary",
  OVERDUE: "error",
  PAID: "success",
  PARTIAL: "info",
  UNPAID: "warning",
} as const;
const agingClassName: Record<string, string> = {
  "0 - 30 Days": "bg-emerald-100 text-emerald-700",
  "31 - 60 Days": "bg-amber-100 text-amber-700",
  "61 - 90 Days": "bg-orange-100 text-orange-700",
  "Over 90 Days": "bg-red-100 text-red-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

function agingLabel(invoice: Invoice) {
  if (invoice.status === "PAID") return "Paid";
  const days = Math.max(
    Math.floor(
      (Date.now() - new Date(invoice.invoiceDate).getTime()) / 86_400_000,
    ),
    0,
  );
  if (days <= 30) return "0 - 30 Days";
  if (days <= 60) return "31 - 60 Days";
  if (days <= 90) return "61 - 90 Days";
  return "Over 90 Days";
}

export function InvoicesPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const [customer, setCustomer] = useState("all");
  const [form, setForm] = useState<InvoiceForm>(defaultForm());
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [invoiceForPrint, setInvoiceForPrint] = useState<Invoice | null>(null);
  const [invoicePendingDelete, setInvoicePendingDelete] =
    useState<Invoice | null>(null);

  const invoicesQuery = useInvoicesQuery({
    customer: customer === "all" ? undefined : customer,
    limit: 10,
    page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const createMutation = useCreateInvoiceMutation();
  const updateStatusMutation = useUpdateInvoiceStatusMutation();
  const deleteMutation = useDeleteInvoiceMutation();
  const invoices = useMemo(
    () => invoicesQuery.data?.data ?? [],
    [invoicesQuery.data?.data],
  );
  const summary = invoicesQuery.data?.summary;
  const customers = useMemo(
    () => Array.from(new Set(invoices.map((invoice) => invoice.customer))),
    [invoices],
  );
  const subtotal = form.items.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.unitPrice),
    0,
  );
  const total =
    subtotal - Number(form.discount || 0) + Number(form.tax || 0);
  const summaryCards = [
    {
      icon: ReceiptText,
      subtitle: "All active invoices",
      title: "Total Invoices",
      tone: "blue",
      value: String(summary?.cards.invoices ?? 0),
    },
    {
      icon: WalletCards,
      subtitle: "Outstanding balance",
      title: "Total Invoice Amount",
      tone: "green",
      value: currency.format(summary?.cards.totalReceivables ?? 0),
    },
    {
      icon: CalendarCheck,
      subtitle: `${summary?.cards.collectedThisMonthCount ?? 0} invoices`,
      title: "Paid This Month",
      tone: "orange",
      value: currency.format(summary?.cards.collectedThisMonth ?? 0),
    },
    {
      icon: AlertCircle,
      subtitle: `${summary?.cards.overdueCount ?? 0} invoices`,
      title: "Overdue Amount",
      tone: "red",
      value: currency.format(summary?.cards.overdue ?? 0),
    },
  ];

  const updateForm = (field: keyof InvoiceForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateItem = (
    index: number,
    field: keyof InvoicePayloadItem,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unitPrice"
                  ? Number(value)
                  : value,
            }
          : item,
      ),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        { account: "", description: "", quantity: 1, unitPrice: 0 },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const saveInvoice = async () => {
    if (!form.customer.trim() || !form.invoiceDate || !form.dueDate) {
      toast({
        title: "Missing invoice details",
        description: "Customer, invoice date, and due date are required.",
        variant: "error",
      });
      return;
    }
    if (form.items.some((item) => !item.description.trim())) {
      toast({
        title: "Missing line item",
        description: "Each item needs description.",
        variant: "error",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        bankAccount: form.bankAccount,
        customer: form.customer,
        description: form.description,
        discount: Number(form.discount || 0),
        dueDate: form.dueDate,
        invoiceDate: form.invoiceDate,
        items: form.items,
        notes: form.notes,
        paidAmount: 0,
        paymentMethod: form.paymentMethod,
        paymentTerms: form.paymentTerms,
        reference: form.reference,
        status: form.status,
        tax: Number(form.tax || 0),
      });
      toast({ title: "Invoice created" });
      setNewInvoiceOpen(false);
      setForm(defaultForm());
    } catch (error) {
      toast({
        title: "Save failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const markSent = async (invoice: Invoice) => {
    try {
      await updateStatusMutation.mutateAsync({ id: invoice.id, status: "UNPAID" });
      toast({ title: "Invoice marked sent", description: invoice.invoiceNo });
    } catch (error) {
      toast({
        title: "Status update failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const deleteInvoice = async () => {
    if (!invoicePendingDelete) return;
    try {
      await deleteMutation.mutateAsync(invoicePendingDelete.id);
      toast({ title: "Invoice deleted", description: invoicePendingDelete.invoiceNo });
      setInvoicePendingDelete(null);
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
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View and manage all customer invoices.
        </p>
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
                  <p className="text-sm font-medium tracking-tight">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {invoicesQuery.isLoading ? "Loading..." : card.value}
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
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[170px_170px_1fr_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Customer
            </span>
            <Select
              value={customer}
              onValueChange={(value) => {
                setPage(1);
                setCustomer(value);
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((item) => (
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
                placeholder="Search invoice, customer, or reference..."
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
              onClick={() => setNewInvoiceOpen(true)}
            >
              <Plus className="size-4" />
              New Invoice
            </Button>
          </div>
        </div>

        <div className="flex gap-7 overflow-x-auto border-b px-4">
          {(["all", "DRAFT", "UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"] as const).map(
            (tab) => (
              <button
                key={tab}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 text-sm font-medium",
                  status === tab
                    ? "border-emerald-700 text-emerald-700"
                    : "border-transparent text-muted-foreground",
                )}
                onClick={() => {
                  setPage(1);
                  setStatus(tab);
                }}
              >
                {tab === "all" ? "All Invoices" : statusLabels[tab]}
              </button>
            ),
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox aria-label="Select all invoices" />
              </TableHead>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aging</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoicesQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length ? (
              invoices.map((invoice) => {
                const aging = agingLabel(invoice);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Checkbox aria-label={`Select invoice ${invoice.invoiceNo}`} />
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      <button
                        className="font-medium text-primary hover:underline"
                        onClick={() => setInvoiceForPrint(invoice)}
                      >
                        {invoice.invoiceNo}
                      </button>
                    </TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.format(amountOf(invoice.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right">
                      {currency.format(amountOf(invoice.paidAmount))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.format(balanceOf(invoice))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[invoice.status]}
                        className="rounded-md"
                      >
                        {statusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium",
                          agingClassName[aging],
                        )}
                      >
                        {aging}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open invoice actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setInvoiceForPrint(invoice)}>
                            <Eye className="size-4" />
                            View invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void markSent(invoice)}>
                            <Send className="size-4" />
                            Mark sent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setInvoicePendingDelete(invoice)}
                          >
                            <Trash2 className="size-4" />
                            Delete invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="py-10 text-center text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {invoices.length ? (page - 1) * 10 + 1 : 0} to{" "}
            {(page - 1) * 10 + invoices.length} of{" "}
            {invoicesQuery.data?.meta.total ?? 0} entries
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
              disabled={page >= (invoicesQuery.data?.meta.totalPages ?? 1)}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={newInvoiceOpen}
        onOpenChange={(open) => {
          setNewInvoiceOpen(open);
          if (!open) setForm(defaultForm());
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
            <DialogDescription>
              Create customer invoice and receivable record.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium">Customer</span>
              <Input
                value={form.customer}
                onChange={(event) => updateForm("customer", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Reference</span>
              <Input
                value={form.reference}
                onChange={(event) => updateForm("reference", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Invoice Date</span>
              <Input
                type="date"
                value={form.invoiceDate}
                onChange={(event) => updateForm("invoiceDate", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Due Date</span>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => updateForm("dueDate", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Terms</span>
              <Input
                value={form.paymentTerms}
                onChange={(event) => updateForm("paymentTerms", event.target.value)}
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
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-medium">Customer Details</span>
              <Textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="size-4" />
                Add Item
              </Button>
            </div>
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border p-3 md:grid-cols-[1.5fr_1fr_90px_130px_36px]"
              >
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(event) => updateItem(index, "description", event.target.value)}
                />
                <Input
                  placeholder="Account"
                  value={item.account ?? ""}
                  onChange={(event) => updateItem(index, "account", event.target.value)}
                />
                <Input
                  min="1"
                  step="1"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, "quantity", event.target.value)}
                />
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={item.unitPrice}
                  onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={form.items.length === 1}
                  onClick={() => removeItem(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium">Discount</span>
              <Input
                min="0"
                step="0.01"
                type="number"
                value={form.discount}
                onChange={(event) => updateForm("discount", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Tax</span>
              <Input
                min="0"
                step="0.01"
                type="number"
                value={form.tax}
                onChange={(event) => updateForm("tax", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Payment Method</span>
              <Input
                value={form.paymentMethod}
                onChange={(event) => updateForm("paymentMethod", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Bank Account</span>
              <Input
                value={form.bankAccount}
                onChange={(event) => updateForm("bankAccount", event.target.value)}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-medium">Notes</span>
              <Textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
              />
            </label>
          </div>

          <div className="rounded-md border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{currency.format(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between font-bold">
              <span>Total</span>
              <span>{currency.format(total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={createMutation.isPending}
              onClick={saveInvoice}
            >
              {createMutation.isPending ? "Saving..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(invoiceForPrint)}
        onOpenChange={(open) => {
          if (!open) setInvoiceForPrint(null);
        }}
      >
        <DialogContent className="max-h-[95vh] max-w-full! gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>Print Invoice {invoiceForPrint?.invoiceNo}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(92vh-65px)] overflow-auto">
            <InvoicePrintPreview invoice={invoiceForPrint ?? undefined} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(invoicePendingDelete)}
        onOpenChange={(open) => {
          if (!open) setInvoicePendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {invoicePendingDelete?.invoiceNo}.
              This action cannot be undone.
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
                void deleteInvoice();
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
