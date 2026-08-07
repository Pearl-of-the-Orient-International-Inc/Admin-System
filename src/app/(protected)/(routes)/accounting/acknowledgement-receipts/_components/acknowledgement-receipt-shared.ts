import type { Invoice } from "@/features/invoices/invoices.types";

export type ReceiptOrganization = "POILE" | "POTSCI" | "PEARL_CHAPLAINCY";

export type AcknowledgementReceiptMeta = {
  organization: ReceiptOrganization;
  course: string;
  school: string;
  paymentType: "Cash" | "Check";
  checkNo: string;
  cashier: string;
};

export const receiptMarker = "ACKNOWLEDGEMENT_RECEIPT";

export const organizationLabels: Record<ReceiptOrganization, string> = {
  PEARL_CHAPLAINCY: "Pearl Chaplaincy",
  POILE: "POILE",
  POTSCI: "POTSCI",
};

export const organizationHeaders: Record<
  ReceiptOrganization,
  { title: string; address: string; tin: string }
> = {
  PEARL_CHAPLAINCY: {
    title:
      "PEARL OF THE ORIENT INTERNATIONAL AUXILIARY CHAPLAIN VALUES EDUCATORS INC.",
    address:
      "B151 Lot 14-18 Ph1, Mabuhay City, Paliparan III, Dasmarinas, Cavite",
    tin: "Non-VAT TIN: 008-775-600-000",
  },
  POILE: {
    title: "PEARL OF THE ORIENT INTERNATIONAL LEADERS AND EDUCATORS INC.",
    address:
      "B151 Lot 14-18 Ph1, Mabuhay City, Paliparan III, Dasmarinas, Cavite",
    tin: "Non-VAT TIN: 008-775-600-000",
  },
  POTSCI: {
    title: "PEARL OF THE ORIENT THEOLOGICAL SEMINARY AND COLLEGE INC.",
    address:
      "B151 Lot 14-18 Ph1, Mabuhay City, Paliparan III, Dasmarinas, Cavite",
    tin: "Non-VAT TIN: 008-775-600-000",
  },
};

export const getReceiptNo = (receipt?: Invoice) =>
  receipt?.reference?.replace("AR-", "") || receipt?.invoiceNo || "";

export const getReceiptMeta = (
  receipt?: Invoice,
): AcknowledgementReceiptMeta => {
  const fallback: AcknowledgementReceiptMeta = {
    cashier: "",
    checkNo: "",
    course: "",
    organization: "POILE",
    paymentType: "Cash",
    school: "",
  };

  if (!receipt?.notes) return fallback;

  try {
    const parsed = JSON.parse(
      receipt.notes,
    ) as Partial<AcknowledgementReceiptMeta>;
    return {
      cashier: parsed.cashier ?? fallback.cashier,
      checkNo: parsed.checkNo ?? fallback.checkNo,
      course: parsed.course ?? fallback.course,
      organization: parsed.organization ?? fallback.organization,
      paymentType: parsed.paymentType ?? fallback.paymentType,
      school: parsed.school ?? fallback.school,
    };
  } catch {
    return fallback;
  }
};
