export type LedgerTransactionType = "INCOME" | "EXPENSE" | "PAYABLE" | "RECEIVABLE";
export type LedgerTransactionStatus = "PAID" | "RECEIVED" | "UNPAID" | "PENDING" | "VOID";

export interface LedgerTransaction {
  id: string;
  transactionNo: string;
  transactionDate: string;
  type: LedgerTransactionType;
  party: string;
  note: string | null;
  account: string;
  accountNo: string | null;
  category: string;
  debit: string;
  credit: string;
  status: LedgerTransactionStatus;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransactionPayload {
  transactionDate: string;
  type: LedgerTransactionType;
  party: string;
  note?: string;
  account: string;
  accountNo?: string;
  category: string;
  debit?: number;
  credit?: number;
  status: LedgerTransactionStatus;
  reference?: string;
}

export interface LedgerAgingSummary {
  total: number;
  segments: { label: string; value: number; percent: number; color: string }[];
}

export interface LedgerSummary {
  cards: {
    cashBalance: number;
    revenue: number;
    expenses: number;
    netCashflow: number;
  };
  trend: { label: string; revenue: number; expenses: number }[];
  receivableAging: LedgerAgingSummary;
  payableAging: LedgerAgingSummary;
}

export interface LedgerTransactionsResponse {
  code: string;
  message: string;
  data: LedgerTransaction[];
  summary: LedgerSummary;
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface LedgerTransactionResponse {
  code: string;
  message: string;
  data: LedgerTransaction;
}

export interface LedgerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: LedgerTransactionType;
  status?: LedgerTransactionStatus;
  account?: string;
}
