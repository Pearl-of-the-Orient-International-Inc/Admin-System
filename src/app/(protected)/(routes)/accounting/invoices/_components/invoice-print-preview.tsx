import {
  Download,
  Mail,
  Printer,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { invoices, printInvoiceItems, type Invoice } from "./invoices-data";

function SettingsSelect({
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
      <span className="text-xs font-medium">{label}</span>
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

function PrintSettings() {
  return (
    <aside className="space-y-5 border-b bg-background p-5 lg:border-r lg:border-b-0">
      <h2 className="text-sm font-bold">Print Settings</h2>
      <SettingsSelect
        label="Template"
        value="standard"
        options={["Standard Template", "Compact Template", "Detailed Template"]}
      />
      <SettingsSelect
        label="Paper Size"
        value="a4"
        options={["A4 (210 x 297 mm)", "Letter (8.5 x 11 in)"]}
      />

      <div className="space-y-2">
        <p className="text-xs font-medium">Orientation</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-emerald-700 bg-emerald-50 text-emerald-700 hover:text-emerald-800"
          >
            <RectangleVertical className="size-4" />
            Portrait
          </Button>
          <Button variant="outline">
            <RectangleHorizontal className="size-4" />
            Landscape
          </Button>
        </div>
      </div>

      <SettingsSelect label="Margins" value="normal" options={["Normal", "Narrow", "Wide"]} />

      <div className="space-y-3">
        <p className="text-xs font-medium">Show Options</p>
        {[
          ["Show Logo", true],
          ["Show Signature", true],
          ["Show Notes", true],
          ["Show Payment Details", true],
          ["Show Aging Summary", false],
        ].map(([label, checked]) => (
          <Label key={label as string} className="text-xs font-normal">
            <Checkbox defaultChecked={checked as boolean} />
            {label}
          </Label>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium">Color Options</p>
        <RadioGroup defaultValue="color" className="gap-2">
          <Label className="text-xs font-normal">
            <RadioGroupItem value="color" />
            Color
          </Label>
          <Label className="text-xs font-normal">
            <RadioGroupItem value="black-white" />
            Black & White
          </Label>
        </RadioGroup>
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
        <Button variant="outline" className="w-full border-emerald-700 text-emerald-700 hover:text-emerald-800">
          <Download className="size-4" />
          Download as PDF
        </Button>
        <Button variant="outline" className="w-full border-emerald-700 text-emerald-700 hover:text-emerald-800">
          <Mail className="size-4" />
          Email Invoice
        </Button>
      </div>
    </aside>
  );
}

function InvoiceDocument({ invoice = invoices[0] }: { invoice?: Invoice }) {
  return (
    <article className="mx-auto min-h-280.75 w-full max-w-198.5 bg-white p-10 text-[12px] text-slate-900 shadow-sm">
      <header className="flex items-start justify-between border-b border-green-800 pb-6">
        <div className="flex gap-4">
          <Image
            src="/main/logo.png"
            alt="Pearl of the Orient logo"
            width={72}
            height={72}
            className="size-18 object-contain"
            priority
          />
          <div>
            <h3 className="text-sm font-extrabold leading-tight">
              Pearl of the Orient
              <br />
              International Auxiliary Chaplain Values Educators Inc.
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              Blk 151 Lot 14-20 Phase 1, Mabuhay City, Dasmarinas City
              <br />
              Cavite, Philippines 4114
              <br />
              Tel: (+63) 919-458-9099 | Email: poile2005official@gmail.com
              <br />
              www.pearlchaplaincy.org
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-extrabold tracking-tight">INVOICE</h2>
          <p className="mt-1 text-base font-bold text-emerald-800">
            {invoice.invoiceNo}
          </p>
          <dl className="mt-6 grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-left">
            <dt className="font-semibold">Invoice Date:</dt>
            <dd>{invoice.invoiceDate}</dd>
            <dt className="font-semibold">Due Date:</dt>
            <dd>{invoice.dueDate}</dd>
            <dt className="font-semibold">Reference:</dt>
            <dd>-</dd>
          </dl>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-16 py-7">
        <div>
          <h4 className="mb-3 font-bold text-emerald-800">BILL TO</h4>
          <p className="font-bold">{invoice.customer}</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            Poblacion, San Pablo City
            <br />
            Laguna, Philippines 4000
            <br />
            Email: stpeterparish@gmail.com
            <br />
            Tel: (049) 987-6543
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-emerald-800">SHIP TO</h4>
          <p className="font-bold">{invoice.customer}</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            Poblacion, San Pablo City
            <br />
            Laguna, Philippines 4000
          </p>
        </div>
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-emerald-800 text-white">
            <th className="w-10 px-3 py-3 text-left">#</th>
            <th className="px-3 py-3 text-left">DESCRIPTION</th>
            <th className="px-3 py-3 text-left">ACCOUNT</th>
            <th className="px-3 py-3 text-center">QTY</th>
            <th className="px-3 py-3 text-right">UNIT PRICE</th>
            <th className="px-3 py-3 text-right">AMOUNT (₱)</th>
          </tr>
        </thead>
        <tbody>
          {printInvoiceItems.map((item, index) => (
            <tr key={item.description} className="border-b">
              <td className="px-3 py-4 text-slate-600">{index + 1}</td>
              <td className="px-3 py-4">
                <p className="font-semibold">{item.description}</p>
                <p className="mt-1 text-slate-500">{item.note}</p>
              </td>
              <td className="px-3 py-4">{item.account}</td>
              <td className="px-3 py-4 text-center">{item.qty}</td>
              <td className="px-3 py-4 text-right">{item.unitPrice}</td>
              <td className="px-3 py-4 text-right font-semibold">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="grid grid-cols-[1fr_270px] gap-8 py-7">
        <div>
          <h4 className="mb-2 font-bold text-emerald-800">NOTES</h4>
          <p className="leading-relaxed text-slate-700">
            Thank you for your continued support and partnership in the ministry.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">33,750.00</span>
          </div>
          <div className="flex justify-between">
            <span>Less: Discount</span>
            <span>0.00</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (12%)</span>
            <span>4,050.00</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-base font-extrabold">
            <span>TOTAL AMOUNT DUE</span>
            <span className="text-emerald-800">₱ 37,800.00</span>
          </div>
        </div>
      </section>

      <section className="rounded-md bg-emerald-50 p-6">
        <h4 className="mb-3 font-bold text-emerald-800">PAYMENT DETAILS</h4>
        <dl className="grid grid-cols-[120px_1fr] gap-y-1">
          <dt>Bank Name:</dt>
          <dd>BPI - Dasmarinas Branch</dd>
          <dt>Account Name:</dt>
          <dd>Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.</dd>
          <dt>Account Number:</dt>
          <dd>1234-5678-90</dd>
        </dl>
        <p className="mt-3 italic text-slate-600">
          Please include your invoice number as payment reference.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-20 py-10">
        <div>
          <p className="mb-8 font-semibold">Prepared By:</p>
          <div className="w-36 border-b border-slate-500" />
          <p className="mt-2 font-bold">Noime Binwag Bayong</p>
          <p className="text-slate-600">Administrator</p>
        </div>
        <div>
          <p className="mb-8 font-semibold">Audited By:</p>
          <div className="w-36 border-b border-slate-500" />
          <p className="mt-2 font-bold">Miriam Turtur</p>
          <p className="text-slate-600">Finance Officer</p>
        </div>
        <div>
          <p className="mb-8 font-semibold">Authorized By:</p>
          <div className="w-36 border-b border-slate-500" />
          <p className="mt-2 font-bold">Bishop Dr. Rodel Manzo</p>
          <p className="text-slate-600">Chief Chaplain</p>
        </div>
      </section>

      <p className="text-center font-serif text-lg italic text-emerald-800">
        Thank you!
      </p>
      <footer className="mt-8 border-t border-emerald-800 pt-4 text-center text-[10px] text-slate-500">
        This is a computer generated invoice and does not require a signature.
      </footer>
    </article>
  );
}

export function InvoicePrintPreview({ invoice }: { invoice?: Invoice }) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid lg:grid-cols-[400px_1fr]">
        <PrintSettings />
        <div className="overflow-auto bg-slate-100 p-5">
          <InvoiceDocument invoice={invoice} />
        </div>
      </div>
    </Card>
  );
}
