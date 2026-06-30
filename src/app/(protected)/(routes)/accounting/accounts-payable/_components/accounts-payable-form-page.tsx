import {
  CalendarDays,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { billAttachment, billItems } from "./accounts-payable-data";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
  placeholder,
  options,
}: {
  placeholder: string;
  options: string[];
}) {
  return (
    <Select>
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

export function AccountsPayableFormPage() {
  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Bill
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new bill to record a payable to a supplier or vendor.
          </p>
        </div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href="/accounting/accounts-payable"
            className="hover:text-foreground"
          >
            Accounts Payable
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground">Add Bill</span>
        </nav>
      </header>

      <Card className="overflow-hidden py-0">
        <div className="grid lg:grid-cols-[420px_1fr]">
          <section className="border-b p-5 lg:border-r lg:border-b-0">
            <h2 className="mb-5 font-semibold">Bill Information</h2>
            <div className="space-y-4">
              <Field label="Bill No.">
                <div className="relative">
                  <Input defaultValue="BILL-2025-" />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    Auto-generated
                  </span>
                </div>
              </Field>
              <Field label="Supplier" required>
                <FormSelect
                  placeholder="Select supplier"
                  options={["XYZ Office Supplies", "Meralco", "PLDT Enterprise"]}
                />
              </Field>
              <Field label="Category" required>
                <FormSelect
                  placeholder="Select category"
                  options={["Supplies & Materials", "Utilities", "Services", "Books"]}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bill Date" required>
                  <div className="flex h-9 items-center gap-2 rounded-md border px-3">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="text-sm">May 31, 2025</span>
                  </div>
                </Field>
                <Field label="Due Date" required>
                  <div className="flex h-9 items-center gap-2 rounded-md border px-3">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="text-sm">Jun 14, 2025</span>
                  </div>
                </Field>
              </div>
              <Field label="Reference / PO / Project">
                <Input placeholder="e.g. PO-2025-001, Project Alpha" />
              </Field>
              <Field label="Description">
                <Textarea
                  placeholder="Enter bill description or notes..."
                  className="min-h-18 resize-none"
                />
                <p className="text-right text-xs text-muted-foreground">0 / 500</p>
              </Field>
            </div>
          </section>

          <section className="p-5">
            <h2 className="mb-5 font-semibold">Bill Details</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Item / Description <span className="text-red-600">*</span></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost (₱)</TableHead>
                  <TableHead className="text-right">Amount (₱)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Input placeholder="Enter item or description" />
                    </TableCell>
                    <TableCell>
                      <FormSelect
                        placeholder="Select category"
                        options={["Supplies", "Utilities", "Services"]}
                      />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue={item.quantity} />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue={item.unitCost} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">0.00</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete line item</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              className="mt-4 border-emerald-700 text-emerald-700 hover:text-emerald-800"
            >
              <Plus className="size-4" />
              Add Item
            </Button>

            <div className="ml-auto mt-8 w-full max-w-sm rounded-md border bg-muted/20 p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal (₱)</span>
                  <span className="font-medium">0.00</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Discount (₱)</span>
                  <Input className="h-8 w-28 text-right" defaultValue="0.00" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Tax (₱)</span>
                  <Input className="h-8 w-28 text-right" defaultValue="0.00" />
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-bold">
                  <span>Total Amount (₱)</span>
                  <span>0.00</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid border-t lg:grid-cols-[1.1fr_1fr]">
          <section className="border-b p-5 lg:border-r lg:border-b-0">
            <h2 className="mb-5 font-semibold">Payment Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Payment Terms">
                <FormSelect placeholder="Net 15" options={["Net 15", "Net 30"]} />
              </Field>
              <Field label="Payment Method">
                <FormSelect
                  placeholder="Bank Transfer"
                  options={["Bank Transfer", "Cash", "Check"]}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Bank Account">
                <FormSelect
                  placeholder="BPI - Operating Account (1234-5678-90)"
                  options={["BPI - Operating Account (1234-5678-90)"]}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Remarks">
                <Textarea
                  placeholder="Enter any remarks..."
                  className="min-h-20 resize-none"
                />
                <p className="text-right text-xs text-muted-foreground">0 / 500</p>
              </Field>
            </div>
          </section>

          <section className="p-5">
            <h2 className="mb-5 font-semibold">Attach Documents</h2>
            <div className="rounded-md border border-dashed p-8 text-center">
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm">
                Drag and drop files here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, JPG, PNG up to 10MB each
              </p>
              <Button variant="outline" className="mt-4">
                Choose Files
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">{billAttachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {billAttachment.size}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Remove attachment</span>
              </Button>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:justify-end">
          <Button variant="outline" className="sm:w-32">
            Cancel
          </Button>
          <Button variant="outline" className="border-emerald-700 text-emerald-700 sm:w-40">
            Save as Draft
          </Button>
          <Button className="bg-emerald-700 hover:bg-emerald-800 sm:w-48">
            Save and Record Bill
          </Button>
        </div>
      </Card>
    </div>
  );
}
