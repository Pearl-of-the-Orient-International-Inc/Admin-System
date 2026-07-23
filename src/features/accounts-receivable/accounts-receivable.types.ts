export type AccountingReceivableStatus =
  | "DRAFT"
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface AccountingReceivableItem {
  id: string;
  description: string;
  account: string | null;
  quantity: string;
  unitPrice: string;
  amount: string;
  sortOrder: number;
  receivableId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingReceivable {
  id: string;
  invoiceNo: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  reference: string | null;
  description: string | null;
  paymentTerms: string | null;
  paymentMethod: string | null;
  bankAccount: string | null;
  notes: string | null;
  discount: string;
  tax: string;
  totalAmount: string;
  paidAmount: string;
  status: AccountingReceivableStatus;
  attachments: { name: string; size?: string; url?: string }[];
  items: AccountingReceivableItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountingReceivablePayloadItem {
  description: string;
  account?: string;
  quantity: number;
  unitPrice: number;
}

export interface AccountingReceivablePayload {
  customer: string;
  invoiceDate: string;
  dueDate: string;
  reference?: string;
  description?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  bankAccount?: string;
  notes?: string;
  discount?: number;
  tax?: number;
  paidAmount?: number;
  status?: AccountingReceivableStatus;
  attachments?: { name: string; size?: string; url?: string }[];
  items: AccountingReceivablePayloadItem[];
}

export interface AccountingReceivablesSummary {
  cards: {
    totalReceivables: number;
    overdue: number;
    overdueCount: number;
    collectedThisMonth: number;
    collectedThisMonthCount: number;
    invoices: number;
  };
  aging: { label: string; value: number; percent: number; color: string }[];
  topCustomers: { name: string; amount: number }[];
  trend: { label: string; value: number }[];
}

export interface AccountingReceivablesResponse {
  code: string;
  message: string;
  data: AccountingReceivable[];
  summary: AccountingReceivablesSummary;
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface AccountingReceivableResponse {
  code: string;
  message: string;
  data: AccountingReceivable;
}

export interface AccountingReceivableQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountingReceivableStatus;
  customer?: string;
}
