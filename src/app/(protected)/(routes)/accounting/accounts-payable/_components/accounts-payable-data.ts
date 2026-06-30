import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  FileText,
  WalletCards,
} from "lucide-react";

export const payableSummaryCards = [
  {
    title: "Total Payables",
    value: "₱ 132,780.00",
    subtitle: "Total outstanding balance",
    tone: "violet",
    icon: BriefcaseBusiness,
  },
  {
    title: "Due This Week",
    value: "₱ 18,650.00",
    subtitle: "5 bills due",
    tone: "orange",
    icon: CalendarClock,
  },
  {
    title: "Due This Month",
    value: "₱ 48,900.00",
    subtitle: "12 bills due",
    tone: "blue",
    icon: FileText,
  },
  {
    title: "Paid This Month",
    value: "₱ 94,230.00",
    subtitle: "18 bills paid",
    tone: "green",
    icon: CheckCircle2,
  },
];

export const payableAging = {
  total: "₱ 132,780.00",
  segments: [
    { label: "0 - 30 Days", value: "₱ 72,450.00", percent: "54.5%", color: "#8ccf3f", amount: 54.5 },
    { label: "31 - 60 Days", value: "₱ 36,800.00", percent: "27.7%", color: "#f7c948", amount: 27.7 },
    { label: "61 - 90 Days", value: "₱ 14,780.00", percent: "11.1%", color: "#fb923c", amount: 11.1 },
    { label: "Over 90 Days", value: "₱ 8,750.00", percent: "6.7%", color: "#f87171", amount: 6.7 },
  ],
};

export const payableTrend = [
  { label: "May 1", value: 18000 },
  { label: "May 4", value: 42000 },
  { label: "May 8", value: 40500 },
  { label: "May 11", value: 56000 },
  { label: "May 14", value: 78000 },
  { label: "May 17", value: 60000 },
  { label: "May 20", value: 101000 },
  { label: "May 22", value: 118000 },
  { label: "May 25", value: 102000 },
  { label: "May 28", value: 134000 },
  { label: "May 29", value: 132780 },
];

export const categoryBreakdown = {
  segments: [
    { label: "Supplies & Materials", value: "₱ 49,850.00", percent: "37.5%", color: "#4ade80", amount: 37.5 },
    { label: "Utilities", value: "₱ 21,450.00", percent: "16.1%", color: "#facc15", amount: 16.1 },
    { label: "Services", value: "₱ 19,800.00", percent: "14.9%", color: "#f59e0b", amount: 14.9 },
    { label: "Maintenance", value: "₱ 15,300.00", percent: "11.5%", color: "#f4c7c3", amount: 11.5 },
    { label: "Others", value: "₱ 26,430.00", percent: "19.9%", color: "#e5e7eb", amount: 19.9 },
  ],
};

export const payableBills = [
  {
    billNo: "BILL-2025-0432",
    supplier: "XYZ Office Supplies",
    category: "Supplies & Materials",
    billDate: "May 28, 2025",
    dueDate: "Jun 12, 2025",
    amount: "₱ 8,450.00",
    paid: "₱ 0.00",
    balance: "₱ 8,450.00",
    status: "Overdue",
  },
  {
    billNo: "BILL-2025-0431",
    supplier: "Meralco",
    category: "Utilities",
    billDate: "May 27, 2025",
    dueDate: "Jun 5, 2025",
    amount: "₱ 6,450.40",
    paid: "₱ 0.00",
    balance: "₱ 6,450.40",
    status: "Overdue",
  },
  {
    billNo: "BILL-2025-0430",
    supplier: "Janitorial Services Inc.",
    category: "Services",
    billDate: "May 26, 2025",
    dueDate: "Jun 10, 2025",
    amount: "₱ 12,000.00",
    paid: "₱ 0.00",
    balance: "₱ 12,000.00",
    status: "Due Soon",
  },
  {
    billNo: "BILL-2025-0429",
    supplier: "Divine Word Publications",
    category: "Books",
    billDate: "May 24, 2025",
    dueDate: "Jun 8, 2025",
    amount: "₱ 5,600.00",
    paid: "₱ 2,600.00",
    balance: "₱ 3,000.00",
    status: "Partial",
  },
  {
    billNo: "BILL-2025-0428",
    supplier: "PLDT Enterprise",
    category: "Utilities",
    billDate: "May 23, 2025",
    dueDate: "Jun 7, 2025",
    amount: "₱ 3,200.00",
    paid: "₱ 3,200.00",
    balance: "₱ 0.00",
    status: "Paid",
  },
  {
    billNo: "BILL-2025-0427",
    supplier: "ABC Construction",
    category: "Maintenance",
    billDate: "May 21, 2025",
    dueDate: "Jun 20, 2025",
    amount: "₱ 25,800.00",
    paid: "₱ 0.00",
    balance: "₱ 25,800.00",
    status: "Open",
  },
];

export const billItems = [
  { id: 1, description: "", category: "", quantity: "1", unitCost: "0.00" },
  { id: 2, description: "", category: "", quantity: "1", unitCost: "0.00" },
];

export const billAttachment = {
  name: "invoice_xyz_office_supplies.pdf",
  size: "245 KB",
  icon: WalletCards,
};
