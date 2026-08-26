export type OwnerReportResponse = {
  code: string;
  message: string;
  data: OwnerReport;
};

export type OwnerAuthResponse = {
  code: string;
  message: string;
  data?: {
    authenticated: boolean;
    expiresInSeconds: number;
  };
};

export type OwnerReport = {
  range: {
    from: string;
    to: string;
  };
  summary: {
    totalMembers: number;
    approvedMembers: number;
    pendingMembers: number;
    urgentPendingApplications: number;
    newMembers: number;
    thisWeeksEvents: number;
    onlineEventsThisWeek: number;
    eventsInRange: number;
    completedEvents: number;
    publishedPosts: number;
    draftPosts: number;
    receiptTotal: number;
    receivableTotal: number;
    receivableCollected: number;
    receivableBalance: number;
    payableTotal: number;
    payablePaid: number;
    payableBalance: number;
    ledgerDebit: number;
    ledgerCredit: number;
    netCashflow: number;
  };
  membershipTrend: Array<{
    month: string;
    applications: number;
    approvals: number;
    events: number;
  }>;
  onboardingBreakdown: Array<{
    label: string;
    value: number;
    percentage: number;
    fill: string;
  }>;
  breakdowns: {
    membersByStatus: OwnerBreakdownItem[];
    membersByType: OwnerBreakdownItem[];
    topMemberLocations: OwnerBreakdownItem[];
    eventsByStatus: OwnerBreakdownItem[];
    eventsByCategory: OwnerBreakdownItem[];
    newsByStatus: OwnerBreakdownItem[];
  };
  cashflowTrend: Array<{
    label: string;
    income: number;
    expense: number;
    net: number;
  }>;
  events: {
    inRange: OwnerEventItem[];
    upcoming: OwnerEventItem[];
  };
  newsBlogs: Array<{
    id: string;
    title: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
    createdAt: string;
    publishedAt: string | null;
  }>;
  accounting: {
    receipts: Array<{
      id: string;
      receiptNo: string;
      name: string;
      receiptDate: string;
      totalAmount: number;
    }>;
    receivables: OwnerAccountingItem[];
    payables: OwnerAccountingItem[];
    ledgerTransactions: Array<{
      id: string;
      transactionNo: string;
      transactionDate: string;
      type: string;
      party: string;
      category: string;
      debit: number;
      credit: number;
      status: string;
    }>;
  };
};

export type OwnerEventItem = {
  id: string;
  name: string;
  startsAt: string;
  location: string;
  status: string;
  attendeeCount: number;
};

export type OwnerBreakdownItem = {
  label: string;
  value: number;
};

export type OwnerAccountingItem = {
  id: string;
  invoiceNo?: string;
  billNo?: string;
  customer?: string;
  supplier?: string;
  invoiceDate?: string;
  billDate?: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
};
