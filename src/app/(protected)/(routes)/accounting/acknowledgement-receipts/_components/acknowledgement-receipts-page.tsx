"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
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
} from "@/features/invoices/invoices.hooks";
import type {
  Invoice,
  InvoicePayloadItem,
} from "@/features/invoices/invoices.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";

import { AcknowledgementReceiptPrintPreview } from "./acknowledgement-receipt-print-preview";
import {
  type AcknowledgementReceiptMeta,
  getReceiptMeta,
  getReceiptNo,
  organizationLabels,
  receiptMarker,
  type ReceiptOrganization,
} from "./acknowledgement-receipt-shared";

type ReceiptForm = {
  name: string;
  date: string;
  course: string;
  school: string;
  organization: ReceiptOrganization;
  paymentType: "Cash" | "Check";
  checkNo: string;
  cashier: string;
  remarks: string;
  items: InvoicePayloadItem[];
};

const pageSize = 10;
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
const defaultParticulars = [
  "Membership",
  "Registration Fee",
  "Misc. Fee",
  "Tuition Fee",
  "Graduation Fee",
  "Training & Seminar",
  "Donation",
  "Others",
];
const defaultForm = (): ReceiptForm => ({
  name: "",
  date: todayInputValue(),
  course: "",
  school: "",
  organization: "POILE",
  paymentType: "Cash",
  checkNo: "",
  cashier: "",
  remarks: "",
  items: defaultParticulars.map((description) => ({
    account: "Acknowledgement Receipt",
    description,
    quantity: 1,
    unitPrice: 0,
  })),
});

function isAcknowledgementReceipt(receipt: Invoice) {
  return receipt.description?.startsWith(receiptMarker);
}

function formTotal(form: ReceiptForm) {
  return form.items.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.unitPrice),
    0,
  );
}

export function AcknowledgementReceiptsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [organization, setOrganization] =
    useState<"all" | ReceiptOrganization>("all");
  const [form, setForm] = useState<ReceiptForm>(defaultForm());
  const [newReceiptOpen, setNewReceiptOpen] = useState(false);
  const [receiptForPrint, setReceiptForPrint] = useState<Invoice | null>(null);
  const [receiptPendingDelete, setReceiptPendingDelete] =
    useState<Invoice | null>(null);

  const receiptsQuery = useInvoicesQuery({ limit: 100, page: 1 });
  const createMutation = useCreateInvoiceMutation();
  const deleteMutation = useDeleteInvoiceMutation();
  const allReceipts = useMemo(
    () =>
      (receiptsQuery.data?.data ?? [])
        .filter(isAcknowledgementReceipt)
        .filter((receipt) => {
          const meta = getReceiptMeta(receipt);
          const query = search.trim().toLowerCase();
          const matchesOrganization =
            organization === "all" || meta.organization === organization;
          const matchesSearch =
            !query ||
            receipt.customer.toLowerCase().includes(query) ||
            getReceiptNo(receipt).toLowerCase().includes(query) ||
            meta.course.toLowerCase().includes(query) ||
            meta.school.toLowerCase().includes(query);

          return matchesOrganization && matchesSearch;
        }),
    [organization, receiptsQuery.data?.data, search],
  );
  const receipts = allReceipts.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(Math.ceil(allReceipts.length / pageSize), 1);
  const totalAmount = allReceipts.reduce(
    (total, receipt) => total + amountOf(receipt.totalAmount),
    0,
  );

  const updateForm = <K extends keyof ReceiptForm>(
    field: K,
    value: ReceiptForm[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

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
        {
          account: "Acknowledgement Receipt",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
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

  const saveReceipt = async () => {
    if (!form.name.trim() || !form.date) {
      toast({
        title: "Missing receipt details",
        description: "Name and receipt date are required.",
        variant: "error",
      });
      return;
    }

    if (form.items.some((item) => !item.description.trim())) {
      toast({
        title: "Missing particulars",
        description: "Every row needs particulars.",
        variant: "error",
      });
      return;
    }

    try {
      const total = formTotal(form);
      const saved = await createMutation.mutateAsync({
        customer: form.name.trim(),
        description: `${receiptMarker}:${organizationLabels[form.organization]}`,
        dueDate: form.date,
        invoiceDate: form.date,
        items: form.items,
        notes: JSON.stringify({
          cashier: form.cashier,
          checkNo: form.checkNo,
          course: form.course,
          organization: form.organization,
          paymentType: form.paymentType,
          school: form.school,
        } satisfies AcknowledgementReceiptMeta),
        paidAmount: total,
        paymentMethod: form.paymentType,
        paymentTerms: "Acknowledgement receipt",
        reference: `AR-${Date.now().toString().slice(-6)}`,
        status: "PAID",
        tax: 0,
        discount: 0,
      });

      toast({ title: "Acknowledgement receipt created" });
      setNewReceiptOpen(false);
      setForm(defaultForm());
      setReceiptForPrint(saved.data);
    } catch (error) {
      toast({
        title: "Save failed",
        description: toApiError(error).message,
        variant: "error",
      });
    }
  };

  const deleteReceipt = async () => {
    if (!receiptPendingDelete) return;
    try {
      await deleteMutation.mutateAsync(receiptPendingDelete.id);
      toast({
        title: "Receipt deleted",
        description: getReceiptNo(receiptPendingDelete),
      });
      setReceiptPendingDelete(null);
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
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Acknowledgement Receipts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, review, and print acknowledgement receipts.
          </p>
        </div>
        <Button
          className="bg-emerald-700 hover:bg-emerald-800"
          onClick={() => setNewReceiptOpen(true)}
        >
          <Plus className="size-4" />
          New Receipt
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <span className="rounded-md border border-blue-100 bg-blue-50/45 p-3 text-blue-700">
              <ReceiptText className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Total Receipts</p>
              <p className="mt-2 text-2xl font-bold">
                {receiptsQuery.isLoading ? "Loading..." : allReceipts.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Filtered receipt records
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <span className="rounded-md border border-emerald-100 bg-emerald-50/45 p-3 text-emerald-700">
              <WalletCards className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Receipt Amount</p>
              <p className="mt-2 text-2xl font-bold">
                {currency.format(totalAmount)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Paid acknowledgement total
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium">Organizations</p>
          <p className="mt-2 text-2xl font-bold">3</p>
          <p className="mt-1 text-sm text-muted-foreground">
            POILE, POTSCI, Pearl Chaplaincy
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden py-0">
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[210px_1fr]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Organization
            </span>
            <Select
              value={organization}
              onValueChange={(value) => {
                setPage(1);
                setOrganization(value as "all" | ReceiptOrganization);
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {Object.entries(organizationLabels).map(([value, label]) => (
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
                placeholder="Search receipt no., name, course, or school..."
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </div>
          </label>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receiptsQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading receipts...
                </TableCell>
              </TableRow>
            ) : receipts.length ? (
              receipts.map((receipt) => {
                const meta = getReceiptMeta(receipt);
                return (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <button
                        className="font-medium text-primary hover:underline"
                        onClick={() => setReceiptForPrint(receipt)}
                      >
                        {getReceiptNo(receipt)}
                      </button>
                    </TableCell>
                    <TableCell>{receipt.customer}</TableCell>
                    <TableCell>
                      {organizationLabels[meta.organization]}
                    </TableCell>
                    <TableCell>{meta.course || "-"}</TableCell>
                    <TableCell>{meta.school || "-"}</TableCell>
                    <TableCell>{formatDate(receipt.invoiceDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.format(amountOf(receipt.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">
                              Open receipt actions
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setReceiptForPrint(receipt)}
                          >
                            <Eye className="size-4" />
                            View receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setReceiptPendingDelete(receipt)}
                          >
                            <Trash2 className="size-4" />
                            Delete receipt
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
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  No acknowledgement receipts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {receipts.length ? (page - 1) * pageSize + 1 : 0} to{" "}
            {(page - 1) * pageSize + receipts.length} of {allReceipts.length}{" "}
            entries
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
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={newReceiptOpen}
        onOpenChange={(open) => {
          setNewReceiptOpen(open);
          if (!open) setForm(defaultForm());
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Acknowledgement Receipt</DialogTitle>
            <DialogDescription>
              Create receipt using acknowledgement format.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium">Organization</span>
              <Select
                value={form.organization}
                onValueChange={(value) =>
                  updateForm("organization", value as ReceiptOrganization)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(organizationLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Date</span>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => updateForm("date", event.target.value)}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-medium">Name</span>
              <Input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Course</span>
              <Input
                value={form.course}
                onChange={(event) => updateForm("course", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">School</span>
              <Input
                value={form.school}
                onChange={(event) => updateForm("school", event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Particulars</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="size-4" />
                Add Row
              </Button>
            </div>
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border p-3 md:grid-cols-[1.5fr_120px_1fr_36px]"
              >
                <Input
                  placeholder="Particulars"
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, "description", event.target.value)
                  }
                />
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={item.unitPrice}
                  onChange={(event) =>
                    updateItem(index, "unitPrice", event.target.value)
                  }
                />
                <Input
                  placeholder="Remarks"
                  value={item.account ?? ""}
                  onChange={(event) =>
                    updateItem(index, "account", event.target.value)
                  }
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
              <span className="text-xs font-medium">Payment Type</span>
              <Select
                value={form.paymentType}
                onValueChange={(value) =>
                  updateForm("paymentType", value as "Cash" | "Check")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Check No.</span>
              <Input
                value={form.checkNo}
                onChange={(event) => updateForm("checkNo", event.target.value)}
                disabled={form.paymentType === "Cash"}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">
                Cashier / Authorized Representative
              </span>
              <Input
                value={form.cashier}
                onChange={(event) => updateForm("cashier", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium">Total</span>
              <Input value={currency.format(formTotal(form))} readOnly />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-medium">General Remarks</span>
              <Textarea
                value={form.remarks}
                onChange={(event) => updateForm("remarks", event.target.value)}
              />
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewReceiptOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={createMutation.isPending}
              onClick={saveReceipt}
            >
              {createMutation.isPending ? "Saving..." : "Create Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(receiptForPrint)}
        onOpenChange={(open) => {
          if (!open) setReceiptForPrint(null);
        }}
      >
        <DialogContent className="max-h-[95vh] max-w-full! gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>
              Print Acknowledgement Receipt {receiptForPrint ? getReceiptNo(receiptForPrint) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(92vh-65px)] overflow-auto">
            <AcknowledgementReceiptPrintPreview
              receipt={receiptForPrint ?? undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(receiptPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setReceiptPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete receipt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {receiptPendingDelete ? getReceiptNo(receiptPendingDelete) : "this receipt"}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-red-600 text-white hover:bg-red-700")}
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteReceipt();
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
