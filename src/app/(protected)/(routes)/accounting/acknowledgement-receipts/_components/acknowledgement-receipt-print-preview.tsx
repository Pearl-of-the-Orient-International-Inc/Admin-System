"use client";

import { Download, Mail, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AcknowledgementReceipt } from "@/features/acknowledgement-receipts/acknowledgement-receipts.types";

import {
  getReceiptNo,
  organizationHeaders,
  organizationLabels,
} from "./acknowledgement-receipt-shared";

const currency = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  style: "currency",
});
const amountOf = (value: string | number | null | undefined) =>
  Number(value ?? 0);
const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "";

function PrintSettings() {
  return (
    <aside className="space-y-5 border-b bg-background p-5 lg:border-r lg:border-b-0">
      <h2 className="text-sm font-bold">Print Settings</h2>
      <div className="space-y-3">
        <p className="text-xs font-medium">Show Options</p>
        {[
          ["Show organization header", true],
          ["Show payment type", true],
          ["Show signature line", true],
          ["Show remarks", true],
        ].map(([label, checked]) => (
          <Label key={label as string} className="text-xs font-normal">
            <Checkbox defaultChecked={checked as boolean} />
            {label}
          </Label>
        ))}
      </div>
      <label className="space-y-1.5">
        <span className="text-xs font-medium">Copies</span>
        <Input type="number" defaultValue={1} min={1} className="h-9" />
      </label>
      <div className="space-y-2 pt-3">
        <Button className="w-full bg-emerald-700 hover:bg-emerald-800">
          <Printer className="size-4" />
          Print Now
        </Button>
        <Button
          variant="outline"
          className="w-full border-emerald-700 text-emerald-700 hover:text-emerald-800"
        >
          <Download className="size-4" />
          Download as PDF
        </Button>
        <Button
          variant="outline"
          className="w-full border-emerald-700 text-emerald-700 hover:text-emerald-800"
        >
          <Mail className="size-4" />
          Email Receipt
        </Button>
      </div>
    </aside>
  );
}

function ReceiptDocument({ receipt }: { receipt?: AcknowledgementReceipt }) {
  const organization = receipt?.organization ?? "POILE";
  const header = organizationHeaders[organization];
  const rows = receipt?.items ?? [];
  const total = amountOf(receipt?.totalAmount);

  return (
    <article className="mx-auto min-h-280.75 w-full max-w-198.5 bg-white p-10 font-serif text-[14px] text-black shadow-sm">
      <header className="text-center">
        <h2 className="mx-auto max-w-180 text-2xl font-black leading-tight tracking-wide uppercase">
          {header.title}
        </h2>
        <p className="mt-1 text-sm font-semibold">{header.address}</p>
        <p className="text-sm">{header.tin}</p>
      </header>

      <section className="mt-10">
        <h1 className="text-3xl font-black tracking-wide">
          ACKNOWLEDGEMENT RECEIPT
        </h1>
        <div className="mt-8 grid grid-cols-[1fr_240px] gap-8">
          <div />
          <div className="flex items-end gap-2">
            <span className="font-bold">Date:</span>
            <span className="flex-1 border-b border-black px-2">
              {formatDate(receipt?.receiptDate)}
            </span>
          </div>
        </div>
        <div className="mt-5 flex items-end gap-2">
          <span className="font-bold">Name:</span>
          <span className="flex-1 border-b border-black px-2">
            {receipt?.name ?? ""}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-5">
          <div className="flex items-end gap-2">
            <span className="font-bold">Course:</span>
            <span className="flex-1 border-b border-black px-2">
              {receipt?.course ?? ""}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-bold">School:</span>
            <span className="flex-1 border-b border-black px-2">
              {receipt?.school ?? ""}
            </span>
          </div>
        </div>
      </section>

      <table className="mt-4 w-full border-collapse text-[16px]">
        <thead>
          <tr>
            <th className="border-2 border-black px-3 py-1 text-center">
              PARTICULARS
            </th>
            <th className="w-42 border-2 border-black px-3 py-1 text-center">
              AMOUNT
            </th>
            <th className="w-44 border-2 border-black px-3 py-1 text-center">
              REMARKS
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(rows.length, 12) }).map((_, index) => {
            const item = rows[index];
            return (
              <tr key={item?.id ?? index}>
                <td className="h-8 border-2 border-black px-3">
                  {item?.particulars ?? ""}
                </td>
                <td className="border-2 border-black px-3 text-right">
                  {amountOf(item?.amount) > 0
                    ? currency.format(amountOf(item?.amount))
                    : ""}
                </td>
                <td className="border-2 border-black px-3">
                  {item?.remarks ?? ""}
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="border-2 border-black px-3 py-1 text-right font-bold">
              TOTAL
            </td>
            <td className="border-2 border-black px-3 py-1 text-right font-bold">
              {currency.format(total)}
            </td>
            <td className="border-2 border-black" />
          </tr>
        </tbody>
      </table>

      <section className="mt-3 grid grid-cols-[1fr_1fr] gap-8 text-[14px]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block size-5 border-2 border-black">
              {receipt?.paymentType === "CASH" ? "X" : ""}
            </span>
            Cash
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block size-5 border-2 border-black">
              {receipt?.paymentType === "CHECK" ? "X" : ""}
            </span>
            Check No.
          </span>
          <span className="min-w-30 border-b border-black px-2">
            {receipt?.checkNo ?? ""}
          </span>
        </div>
        <p className="text-xs italic">
          Received the above goods in good order and condition.
        </p>
      </section>

      <section className="mt-16 grid grid-cols-2 items-end">
        <div className="flex items-baseline gap-12">
          <span className="text-4xl font-black text-red-700">No</span>
          <span className="text-4xl font-black tracking-[0.3em] text-red-700">
            {getReceiptNo(receipt).slice(-4)}
          </span>
        </div>
        <div className="text-center">
          <div className="mx-auto w-72 border-b border-black px-2 pb-1">
            {receipt?.cashier ?? ""}
          </div>
          <p className="mt-2 text-xs font-bold">
            Cashier / Authorized Representative
          </p>
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-slate-500">
        {organizationLabels[organization]} acknowledgement receipt
      </footer>
    </article>
  );
}

export function AcknowledgementReceiptPrintPreview({
  receipt,
}: {
  receipt?: AcknowledgementReceipt;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid lg:grid-cols-[360px_1fr]">
        <PrintSettings />
        <div className="overflow-auto bg-slate-100 p-5">
          <ReceiptDocument receipt={receipt} />
        </div>
      </div>
    </Card>
  );
}
