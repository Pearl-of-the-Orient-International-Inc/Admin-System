import {
  CalendarCheck,
  CalendarClock,
  FileText,
  ReceiptText,
} from "lucide-react";

export const receivableSummaryCards = [
  {
    title: "Total Receivables",
    value: "₱ 186,450.00",
    subtitle: "Total outstanding balance",
    tone: "blue",
    icon: ReceiptText,
  },
  {
    title: "Current (0-30 Days)",
    value: "₱ 98,250.00",
    subtitle: "52.7% of total",
    tone: "green",
    icon: CalendarCheck,
  },
  {
    title: "31-60 Days",
    value: "₱ 45,600.00",
    subtitle: "24.5% of total",
    tone: "orange",
    icon: CalendarClock,
  },
  {
    title: "61-90 Days",
    value: "₱ 22,300.00",
    subtitle: "12.0% of total",
    tone: "amber",
    icon: FileText,
  },
];

export const receivableAging = {
  total: "₱ 186,450.00",
  segments: [
    { label: "0 - 30 Days", value: "₱ 98,250.00", percent: "52.7%", color: "#8ccf3f", amount: 52.7 },
    { label: "31 - 60 Days", value: "₱ 45,600.00", percent: "24.5%", color: "#f7c948", amount: 24.5 },
    { label: "61 - 90 Days", value: "₱ 22,300.00", percent: "12.0%", color: "#fb923c", amount: 12 },
    { label: "Over 90 Days", value: "₱ 20,300.00", percent: "10.8%", color: "#f87171", amount: 10.8 },
  ],
};

export const receivableTrend = [
  { label: "May 1", value: 16000 },
  { label: "May 4", value: 39000 },
  { label: "May 8", value: 32000 },
  { label: "May 11", value: 51000 },
  { label: "May 13", value: 76000 },
  { label: "May 15", value: 61000 },
  { label: "May 18", value: 73000 },
  { label: "May 20", value: 88000 },
  { label: "May 22", value: 113000 },
  { label: "May 24", value: 104000 },
  { label: "May 26", value: 95000 },
  { label: "May 28", value: 120000 },
  { label: "May 29", value: 132000 },
  { label: "May 31", value: 142500 },
];

export const topCustomers = [
  { name: "St. Peter Parish", amount: "₱ 42,250.00" },
  { name: "Divine Word Publications", amount: "₱ 28,750.00" },
  { name: "St. John Community", amount: "₱ 23,600.00" },
  { name: "ABC Learning Center", amount: "₱ 18,300.00" },
  { name: "Faith Formation Center", amount: "₱ 15,900.00" },
];

export const receivableInvoices = [
  {
    invoiceNo: "INV-2025-0587",
    date: "May 30, 2025",
    customer: "St. Peter Parish",
    dueDate: "Jun 14, 2025",
    total: "₱ 42,250.00",
    paid: "₱ 0.00",
    balance: "₱ 42,250.00",
    aging: "0 - 30 Days",
    status: "Unpaid",
  },
  {
    invoiceNo: "INV-2025-0586",
    date: "May 29, 2025",
    customer: "Divine Word Publications",
    dueDate: "Jun 12, 2025",
    total: "₱ 28,750.00",
    paid: "₱ 10,000.00",
    balance: "₱ 18,750.00",
    aging: "0 - 30 Days",
    status: "Partial",
  },
  {
    invoiceNo: "INV-2025-0585",
    date: "May 28, 2025",
    customer: "St. John Community",
    dueDate: "Jun 20, 2025",
    total: "₱ 23,600.00",
    paid: "₱ 0.00",
    balance: "₱ 23,600.00",
    aging: "31 - 60 Days",
    status: "Unpaid",
  },
  {
    invoiceNo: "INV-2025-0584",
    date: "May 27, 2025",
    customer: "ABC Learning Center",
    dueDate: "Jun 25, 2025",
    total: "₱ 18,300.00",
    paid: "₱ 0.00",
    balance: "₱ 18,300.00",
    aging: "31 - 60 Days",
    status: "Unpaid",
  },
  {
    invoiceNo: "INV-2025-0583",
    date: "May 26, 2025",
    customer: "Faith Formation Center",
    dueDate: "Jul 5, 2025",
    total: "₱ 15,900.00",
    paid: "₱ 2,000.00",
    balance: "₱ 13,900.00",
    aging: "61 - 90 Days",
    status: "Partial",
  },
  {
    invoiceNo: "INV-2025-0582",
    date: "May 24, 2025",
    customer: "Our Lady Parish",
    dueDate: "Jul 10, 2025",
    total: "₱ 12,800.00",
    paid: "₱ 0.00",
    balance: "₱ 12,800.00",
    aging: "Over 90 Days",
    status: "Unpaid",
  },
];

export const invoiceItems = [
  { id: 1, description: "", account: "", quantity: "1", unitPrice: "0.00" },
  { id: 2, description: "", account: "", quantity: "1", unitPrice: "0.00" },
];
