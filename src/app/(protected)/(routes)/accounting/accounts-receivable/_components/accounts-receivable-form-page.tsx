"use client";

import { ChevronRight, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  useAccountReceivableQuery,
  useCreateAccountReceivableMutation,
  useDeleteAccountReceivableMutation,
  useUpdateAccountReceivableMutation,
} from "@/features/accounts-receivable/accounts-receivable.hooks";
import type {
  AccountingReceivable,
  AccountingReceivablePayload,
  AccountingReceivableStatus,
} from "@/features/accounts-receivable/accounts-receivable.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";

type ItemForm = {
  account: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type FormState = {
  attachmentName: string;
  bankAccount: string;
  customer: string;
  description: string;
  discount: string;
  dueDate: string;
  invoiceDate: string;
  notes: string;
  paidAmount: string;
  paymentMethod: string;
  paymentTerms: string;
  reference: string;
  tax: string;
};

const todayInputValue = () => new Date().toISOString().slice(0, 10);
const defaultState: FormState = {
  attachmentName: "",
  bankAccount: "",
  customer: "",
  description: "",
  discount: "0",
  dueDate: todayInputValue(),
  invoiceDate: todayInputValue(),
  notes: "",
  paidAmount: "0",
  paymentMethod: "Bank Transfer",
  paymentTerms: "Net 15",
  reference: "",
  tax: "0",
};
const defaultItem = (): ItemForm => ({
  account: "",
  description: "",
  quantity: "1",
  unitPrice: "0",
});
const accounts = ["Tuition Fees", "Donations", "Enrollment Fees", "Training Fees", "Other Income"];
const paymentTerms = ["Due on Receipt", "Net 7", "Net 15", "Net 30", "Net 60"];
const paymentMethods = ["Bank Transfer", "Cash", "Check", "GCash", "Maya"];
const currency = new Intl.NumberFormat("en-PH", { currency: "PHP", style: "currency" });
const toInputDate = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : todayInputValue());
const amountOf = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function Field({ children, label, required }: { children: React.ReactNode; label: string; required?: boolean }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function FormSelect({
  onValueChange,
  options,
  placeholder,
  value,
}: {
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const mapReceivableToState = (receivable: AccountingReceivable): FormState => ({
  attachmentName: receivable.attachments?.[0]?.name ?? "",
  bankAccount: receivable.bankAccount ?? "",
  customer: receivable.customer,
  description: receivable.description ?? "",
  discount: String(receivable.discount ?? "0"),
  dueDate: toInputDate(receivable.dueDate),
  invoiceDate: toInputDate(receivable.invoiceDate),
  notes: receivable.notes ?? "",
  paidAmount: String(receivable.paidAmount ?? "0"),
  paymentMethod: receivable.paymentMethod ?? "",
  paymentTerms: receivable.paymentTerms ?? "",
  reference: receivable.reference ?? "",
  tax: String(receivable.tax ?? "0"),
});

const mapReceivableToItems = (receivable: AccountingReceivable): ItemForm[] =>
  receivable.items.length
    ? receivable.items.map((item) => ({
        account: item.account ?? "",
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      }))
    : [defaultItem()];

export function AccountsReceivableFormPage({ receivableId }: { receivableId?: string }) {
  const isCreateMode = !receivableId || receivableId === "new";
  const router = useRouter();
  const { toast } = useToast();
  const receivableQuery = useAccountReceivableQuery(receivableId ?? "", !isCreateMode);
  const createMutation = useCreateAccountReceivableMutation();
  const updateMutation = useUpdateAccountReceivableMutation();
  const deleteMutation = useDeleteAccountReceivableMutation();
  const [form, setForm] = useState<FormState>(defaultState);
  const [items, setItems] = useState<ItemForm[]>([defaultItem()]);

  useEffect(() => {
    const receivableData = receivableQuery.data?.data;
    if (!receivableData) return;
    queueMicrotask(() => {
      setForm(mapReceivableToState(receivableData));
      setItems(mapReceivableToItems(receivableData));
    });
  }, [receivableQuery.data?.data]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + amountOf(item.quantity) * amountOf(item.unitPrice), 0),
    [items],
  );
  const total = Math.max(subtotal - amountOf(form.discount) + amountOf(form.tax), 0);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const receivable = receivableQuery.data?.data;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const updateItem = (index: number, field: keyof ItemForm, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  };
  const buildPayload = (status: AccountingReceivableStatus): AccountingReceivablePayload => ({
    attachments: form.attachmentName ? [{ name: form.attachmentName }] : [],
    bankAccount: form.bankAccount,
    customer: form.customer,
    description: form.description,
    discount: amountOf(form.discount),
    dueDate: form.dueDate,
    invoiceDate: form.invoiceDate,
    items: items.map((item) => ({
      account: item.account,
      description: item.description,
      quantity: amountOf(item.quantity),
      unitPrice: amountOf(item.unitPrice),
    })),
    notes: form.notes,
    paidAmount: amountOf(form.paidAmount),
    paymentMethod: form.paymentMethod,
    paymentTerms: form.paymentTerms,
    reference: form.reference,
    status,
    tax: amountOf(form.tax),
  });

  const save = async (status: AccountingReceivableStatus) => {
    try {
      const payload = buildPayload(status);
      const response = isCreateMode
        ? await createMutation.mutateAsync(payload)
        : await updateMutation.mutateAsync({ id: receivableId as string, payload });
      toast({ title: isCreateMode ? "Invoice created" : "Invoice updated", description: response.data.invoiceNo });
      router.push("/accounting/accounts-receivable");
    } catch (error) {
      toast({ title: "Save failed", description: toApiError(error).message, variant: "error" });
    }
  };

  const onDelete = async () => {
    if (!receivable || !window.confirm(`Delete ${receivable.invoiceNo}?`)) return;
    try {
      await deleteMutation.mutateAsync(receivable.id);
      toast({ title: "Invoice deleted", description: receivable.invoiceNo });
      router.push("/accounting/accounts-receivable");
    } catch (error) {
      toast({ title: "Delete failed", description: toApiError(error).message, variant: "error" });
    }
  };

  if (!isCreateMode && receivableQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading invoice...</div>;
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isCreateMode ? "New Invoice" : `Edit ${receivable?.invoiceNo ?? "Invoice"}`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isCreateMode ? "Create a customer invoice." : "Update invoice details, items, payment info, and notes."}
          </p>
        </div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <ChevronRight className="size-3" />
          <Link href="/accounting/accounts-receivable" className="hover:text-foreground">Accounts Receivable</Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground">{isCreateMode ? "New Invoice" : receivable?.invoiceNo}</span>
        </nav>
      </header>

      <Card className="overflow-hidden py-0">
        <div className="grid lg:grid-cols-[420px_1fr]">
          <section className="border-b p-5 lg:border-r lg:border-b-0">
            <h2 className="mb-5 font-semibold">Invoice Information</h2>
            <div className="space-y-4">
              <Field label="Invoice Number">
                <Input disabled value={receivable?.invoiceNo ?? "Auto-generated"} onChange={() => undefined} />
              </Field>
              <Field label="Customer" required>
                <Input placeholder="Enter customer" value={form.customer} onChange={(event) => updateField("customer", event.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Invoice Date" required>
                  <Input type="date" value={form.invoiceDate} onChange={(event) => updateField("invoiceDate", event.target.value)} />
                </Field>
                <Field label="Due Date" required>
                  <Input type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} />
                </Field>
              </div>
              <Field label="Reference / PO / Project">
                <Input placeholder="e.g. PO-2026-001, Project Alpha" value={form.reference} onChange={(event) => updateField("reference", event.target.value)} />
              </Field>
              <Field label="Description">
                <Textarea className="min-h-20 resize-none" maxLength={500} placeholder="Enter invoice description or notes..." value={form.description} onChange={(event) => updateField("description", event.target.value)} />
                <p className="text-right text-xs text-muted-foreground">{form.description.length} / 500</p>
              </Field>
            </div>
          </section>

          <section className="p-5">
            <h2 className="mb-5 font-semibold">Invoice Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead><TableHead>Item / Description <span className="text-red-600">*</span></TableHead><TableHead>Account</TableHead><TableHead>Quantity</TableHead><TableHead>Unit Price</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell><Input placeholder="Enter item or description" value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} /></TableCell>
                    <TableCell><FormSelect placeholder="Select account" options={accounts} value={item.account} onValueChange={(value) => updateItem(index, "account", value)} /></TableCell>
                    <TableCell><Input min="0" step="0.01" type="number" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} /></TableCell>
                    <TableCell><Input min="0" step="0.01" type="number" value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} /></TableCell>
                    <TableCell className="text-right font-semibold">{currency.format(amountOf(item.quantity) * amountOf(item.unitPrice))}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="mt-4 border-emerald-700 text-emerald-700 hover:text-emerald-800" onClick={() => setItems((current) => [...current, defaultItem()])}>
              <Plus className="size-4" />Add Item
            </Button>
            <div className="ml-auto mt-8 w-full max-w-sm rounded-md border bg-muted/20 p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{currency.format(subtotal)}</span></div>
                <div className="flex items-center justify-between gap-4"><span>Discount</span><Input className="h-8 w-28 text-right" min="0" step="0.01" type="number" value={form.discount} onChange={(event) => updateField("discount", event.target.value)} /></div>
                <div className="flex items-center justify-between gap-4"><span>Tax</span><Input className="h-8 w-28 text-right" min="0" step="0.01" type="number" value={form.tax} onChange={(event) => updateField("tax", event.target.value)} /></div>
                <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total Amount</span><span>{currency.format(total)}</span></div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid border-t lg:grid-cols-[1.1fr_1fr]">
          <section className="border-b p-5 lg:border-r lg:border-b-0">
            <h2 className="mb-5 font-semibold">Payment Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Payment Terms"><FormSelect placeholder="Select terms" options={paymentTerms} value={form.paymentTerms} onValueChange={(value) => updateField("paymentTerms", value)} /></Field>
              <Field label="Payment Method"><FormSelect placeholder="Select method" options={paymentMethods} value={form.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value)} /></Field>
              <Field label="Paid Amount"><Input min="0" step="0.01" type="number" value={form.paidAmount} onChange={(event) => updateField("paidAmount", event.target.value)} /></Field>
              <Field label="Bank Account"><Input placeholder="e.g. BPI - Operating Account" value={form.bankAccount} onChange={(event) => updateField("bankAccount", event.target.value)} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Notes to Customer">
                <Textarea className="min-h-20 resize-none" maxLength={500} placeholder="This note will appear on the invoice..." value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
                <p className="text-right text-xs text-muted-foreground">{form.notes.length} / 500</p>
              </Field>
            </div>
          </section>
          <section className="p-5">
            <h2 className="mb-5 font-semibold">Attach Documents</h2>
            <Field label="Attachment File Name">
              <Input placeholder="invoice_support.pdf" value={form.attachmentName} onChange={(event) => updateField("attachmentName", event.target.value)} />
            </Field>
            {form.attachmentName ? (
              <div className="mt-4 flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3"><FileText className="size-5 text-red-600" /><div><p className="text-sm font-medium">{form.attachmentName}</p><p className="text-xs text-muted-foreground">Stored as metadata</p></div></div>
                <Button variant="ghost" size="icon-sm" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => updateField("attachmentName", "")}><Trash2 className="size-4" /></Button>
              </div>
            ) : null}
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:justify-end">
          {!isCreateMode ? <Button variant="outline" className="border-red-200 text-red-600 hover:text-red-700 sm:w-32" onClick={onDelete}>Delete</Button> : null}
          <Button asChild variant="outline" className="sm:w-32"><Link href="/accounting/accounts-receivable">Cancel</Link></Button>
          <Button variant="outline" className="border-emerald-700 text-emerald-700 sm:w-40" disabled={isPending} onClick={() => save("DRAFT")}>Save as Draft</Button>
          <Button className="bg-emerald-700 hover:bg-emerald-800 sm:w-52" disabled={isPending} onClick={() => save("UNPAID")}>{isPending ? "Saving..." : "Save and Create Invoice"}</Button>
        </div>
      </Card>
    </div>
  );
}
