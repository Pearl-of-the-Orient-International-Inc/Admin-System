import type { AcknowledgementReceipt } from "@/features/acknowledgement-receipts/acknowledgement-receipts.types";

export type ReceiptOrganization = AcknowledgementReceipt["organization"];

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

export const getReceiptNo = (receipt?: AcknowledgementReceipt) =>
  receipt?.receiptNo || "";
