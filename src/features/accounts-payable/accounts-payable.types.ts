export type AccountingPayableStatus =
  | "DRAFT"
  | "OPEN"
  | "DUE_SOON"
  | "OVERDUE"
  | "PARTIAL"
  | "PAID"
  | "CANCELLED";

export interface AccountingPayableItem {
  id: string;
  description: string;
  category: string | null;
  quantity: string;
  unitCost: string;
  amount: string;
  sortOrder: number;
  payableId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingPayable {
  id: string;
  billNo: string;
  supplier: string;
  category: string;
  billDate: string;
  dueDate: string;
  reference: string | null;
  description: string | null;
  paymentTerms: string | null;
  paymentMethod: string | null;
  bankAccount: string | null;
  remarks: string | null;
  discount: string;
  tax: string;
  totalAmount: string;
  paidAmount: string;
  status: AccountingPayableStatus;
  attachments: { name: string; size?: string; url?: string }[];
  items: AccountingPayableItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountingPayablePayloadItem {
  description: string;
  category?: string;
  quantity: number;
  unitCost: number;
}

export interface AccountingPayablePayload {
  supplier: string;
  category: string;
  billDate: string;
  dueDate: string;
  reference?: string;
  description?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  bankAccount?: string;
  remarks?: string;
  discount?: number;
  tax?: number;
  paidAmount?: number;
  status?: AccountingPayableStatus;
  attachments?: { name: string; size?: string; url?: string }[];
  items: AccountingPayablePayloadItem[];
}

export interface AccountingPayablesSummary {
  cards: {
    totalPayables: number;
    dueThisWeek: number;
    dueThisWeekCount: number;
    dueThisMonth: number;
    dueThisMonthCount: number;
    paidThisMonth: number;
    paidThisMonthCount: number;
  };
  aging: { label: string; value: number; percent: number; color: string }[];
  categories: { label: string; value: number; percent: number }[];
  trend: { label: string; value: number }[];
}

export interface AccountingPayablesResponse {
  code: string;
  message: string;
  data: AccountingPayable[];
  summary: AccountingPayablesSummary;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AccountingPayableResponse {
  code: string;
  message: string;
  data: AccountingPayable;
}

export interface AccountingPayableQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountingPayableStatus;
  category?: string;
  supplier?: string;
}
