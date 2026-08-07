export type ReceiptOrganization = "POILE" | "POTSCI" | "PEARL_CHAPLAINCY";
export type ReceiptPaymentType = "CASH" | "CHECK";

export interface AcknowledgementReceiptItem {
  id: string;
  particulars: string;
  amount: string;
  remarks: string | null;
  sortOrder: number;
  receiptId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcknowledgementReceipt {
  id: string;
  receiptNo: string;
  organization: ReceiptOrganization;
  name: string;
  receiptDate: string;
  course: string | null;
  school: string | null;
  paymentType: ReceiptPaymentType;
  checkNo: string | null;
  cashier: string | null;
  remarks: string | null;
  totalAmount: string;
  items: AcknowledgementReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AcknowledgementReceiptPayloadItem {
  particulars: string;
  amount?: number;
  remarks?: string;
}

export interface AcknowledgementReceiptPayload {
  organization: ReceiptOrganization;
  name: string;
  receiptDate: string;
  course?: string;
  school?: string;
  paymentType?: ReceiptPaymentType;
  checkNo?: string;
  cashier?: string;
  remarks?: string;
  items: AcknowledgementReceiptPayloadItem[];
}

export interface AcknowledgementReceiptsResponse {
  code: string;
  message: string;
  data: AcknowledgementReceipt[];
  summary: {
    cards: {
      receipts: number;
      totalAmount: number;
    };
    organizations: Record<string, number>;
  };
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface AcknowledgementReceiptResponse {
  code: string;
  message: string;
  data: AcknowledgementReceipt;
}

export interface AcknowledgementReceiptQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organization?: ReceiptOrganization;
}
