"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  BarChart3,
  Banknote,
  CalendarDays,
  CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  Landmark,
  Newspaper,
  Settings,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  changeOwnerPin,
  getOwnerReport,
  getOwnerSession,
  loginOwner,
  logoutOwner,
  touchOwnerSession,
} from "@/features/owner/owner.api";
import type { OwnerEventItem, OwnerReport } from "@/features/owner/owner.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 1000;

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat("en-US");

const trendChartConfig = {
  applications: {
    label: "Applications",
    color: "var(--color-chart-2)",
  },
  approvals: {
    label: "Approvals",
    color: "var(--color-chart-3)",
  },
  events: {
    label: "Events",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig;

const onboardingChartConfig = {
  value: {
    label: "Members",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

function defaultDateRange() {
  const now = new Date();
  return {
    from: toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toDateInputValue(now),
  };
}

export function OwnerPortal() {
  const initialRange = useMemo(defaultDateRange, []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(`${initialRange.from}T00:00:00`),
    to: new Date(`${initialRange.to}T00:00:00`),
  });
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [report, setReport] = useState<OwnerReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchRef = useRef(0);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
  }, []);

  const lockOwnerView = useCallback(async () => {
    clearIdleTimer();
    setIsAuthenticated(false);
    setReport(null);
    setPin("");
    await logoutOwner().catch(() => null);
  }, [clearIdleTimer]);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      void lockOwnerView();
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimer, lockOwnerView]);

  const loadReport = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingReport(true);
    setError(null);

    try {
      const response = await getOwnerReport({
        from,
        to,
      });
      setReport(response.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load owner report.",
      );
      setIsAuthenticated(false);
    } finally {
      setIsLoadingReport(false);
    }
  }, [from, isAuthenticated, to]);

  useEffect(() => {
    getOwnerSession()
      .then(() => {
        setIsAuthenticated(true);
        resetIdleTimer();
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => setIsCheckingSession(false));

    return clearIdleTimer;
  }, [clearIdleTimer, resetIdleTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;

    void loadReport();
  }, [isAuthenticated, loadReport]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      resetIdleTimer();

      const now = Date.now();
      if (now - lastTouchRef.current > TOUCH_INTERVAL_MS) {
        lastTouchRef.current = now;
        void touchOwnerSession().catch(() => lockOwnerView());
      }
    };

    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [isAuthenticated, lockOwnerView, resetIdleTimer]);

  const handlePinChange = async (value: string) => {
    const nextPin = value.replace(/\D/g, "").slice(0, 6);
    setPin(nextPin);
    setError(null);

    if (nextPin.length !== 6 || isSubmittingPin) return;

    setIsSubmittingPin(true);

    try {
      await loginOwner(nextPin);
      setIsAuthenticated(true);
      setPin("");
      resetIdleTimer();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Invalid owner PIN.",
      );
      setPin("");
    } finally {
      setIsSubmittingPin(false);
    }
  };

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f4] px-6">
        <p className="text-lg font-medium text-[#334235]">
          Loading owner view...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f4] px-6">
        <section className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/main/logo.png"
              alt="Pearl of the Orient"
              className="mx-auto size-20 rounded-full object-contain"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Chief chaplain access
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter 6-digit PIN to open chief chaplain portal.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={handlePinChange}
              disabled={isSubmittingPin}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="size-12 text-xl"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#1d241f]">
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#145224]">
                Pearl of the Orient
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Chief chaplain report
              </h1>
              <p className="text-muted-foreground text-sm">
                One-page view. Session locks after 10 minutes without activity.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <DateRangePicker
                date={dateRange}
                onSelect={(nextRange) => {
                  setDateRange(nextRange);
                  if (nextRange?.from) {
                    setFrom(toDateInputValue(nextRange.from));
                  }
                  if (nextRange?.to) {
                    setTo(toDateInputValue(nextRange.to));
                  }
                }}
              />
              <ChangePinDialog />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <OwnerReportView report={report} isLoading={isLoadingReport} />
      </section>
    </main>
  );
}

function OwnerReportView({
  report,
  isLoading,
}: {
  report: OwnerReport | null;
  isLoading: boolean;
}) {
  if (isLoading && !report) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-lg border bg-white"
          />
        ))}
      </div>
    );
  }

  if (!report) return null;

  const moneyCards = [
    {
      title: "Cash Collected",
      value: currency.format(report.summary.receiptTotal),
      note: "Acknowledgement receipts",
      icon: Banknote,
      tone: "green",
    },
    {
      title: "Receivable Balance",
      value: currency.format(report.summary.receivableBalance),
      note: `${currency.format(report.summary.receivableCollected)} collected`,
      icon: WalletCards,
      tone: "blue",
    },
    {
      title: "Payable Balance",
      value: currency.format(report.summary.payableBalance),
      note: `${currency.format(report.summary.payablePaid)} paid`,
      icon: Landmark,
      tone: "amber",
    },
    {
      title: "Net Cashflow",
      value: currency.format(report.summary.netCashflow),
      note: "Ledger debit less credit",
      icon: TrendingUp,
      tone: report.summary.netCashflow >= 0 ? "green" : "red",
    },
  ];

  const operationCards = [
    {
      title: "Approved Members",
      value: numberFormat.format(report.summary.approvedMembers),
      note: `${numberFormat.format(report.summary.totalMembers)} active records`,
      icon: Users,
      tone: "green",
    },
    {
      title: "Pending Members",
      value: numberFormat.format(report.summary.pendingMembers),
      note: `${numberFormat.format(report.summary.urgentPendingApplications)} waiting over 7 days`,
      icon: Clock,
      tone: "amber",
    },
    {
      title: "This Week's Events",
      value: numberFormat.format(report.summary.thisWeeksEvents),
      note: `${numberFormat.format(report.summary.onlineEventsThisWeek)} online`,
      icon: CalendarDays,
      tone: "blue",
    },
    {
      title: "Published Posts",
      value: numberFormat.format(report.summary.publishedPosts),
      note: `${numberFormat.format(report.summary.draftPosts)} drafts`,
      icon: Newspaper,
      tone: "violet",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moneyCards.map((card) => (
          <OwnerMetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {operationCards.map((card) => (
          <OwnerMetricCard key={card.title} {...card} />
        ))}
      </section>

      <OwnerPanel
        title="Event Calendar"
        icon={<CalendarDays className="size-5" />}
      >
        <OwnerEventCalendar
          month={new Date(report.range.from)}
          events={report.events.inRange}
        />
      </OwnerPanel>

      <section className="grid gap-4">
        <OwnerPanel
          title="Membership and Events Trend"
          icon={<BarChart3 className="size-5" />}
        >
          <ChartContainer
            config={trendChartConfig}
            className="aspect-auto h-72 w-full"
          >
            <BarChart data={report.membershipTrend} barCategoryGap="24%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={label}
                  />
                )}
              />
              <Bar
                dataKey="applications"
                fill="var(--color-applications)"
                maxBarSize={28}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="approvals"
                fill="var(--color-approvals)"
                maxBarSize={28}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="events"
                fill="var(--color-events)"
                maxBarSize={28}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </OwnerPanel>

        <OwnerPanel
          title="Onboarding Queue"
          icon={<Users className="size-5" />}
        >
          <ChartContainer
            config={onboardingChartConfig}
            className="aspect-auto h-72 w-full"
          >
            <BarChart
              data={report.onboardingBreakdown}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                width={132}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={label}
                    indicator="line"
                  />
                )}
              />
              <Bar dataKey="value" radius={999} barSize={30}>
                {report.onboardingBreakdown.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid gap-2">
            {report.onboardingBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="shrink-0 font-medium">
                  {numberFormat.format(item.value)} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </OwnerPanel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OwnerMetricCard
          title="New Members"
          value={numberFormat.format(report.summary.newMembers)}
          note="Created in selected date range"
          icon={Users}
          tone="blue"
        />
        <OwnerMetricCard
          title="Events In Range"
          value={numberFormat.format(report.summary.eventsInRange)}
          note={`${numberFormat.format(report.summary.completedEvents)} completed`}
          icon={CalendarDays}
          tone="green"
        />
        <OwnerMetricCard
          title="Receivable Total"
          value={currency.format(report.summary.receivableTotal)}
          note="Invoices inside selected range"
          icon={WalletCards}
          tone="violet"
        />
        <OwnerMetricCard
          title="Payable Total"
          value={currency.format(report.summary.payableTotal)}
          note="Bills inside selected range"
          icon={Landmark}
          tone="amber"
        />
      </section>

      <section className="grid gap-4">
        <OwnerPanel
          title="Cashflow Trend"
          icon={<TrendingUp className="size-5" />}
        >
          <ChartContainer
            config={{
              income: { label: "Income", color: "#16a34a" },
              expense: { label: "Expense", color: "#dc2626" },
            }}
            className="aspect-auto h-72 w-full"
          >
            <BarChart data={report.cashflowTrend} barCategoryGap="20%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={label}
                  />
                )}
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                maxBarSize={28}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                maxBarSize={28}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </OwnerPanel>

        <OwnerPanel
          title="Quick Breakdowns"
          icon={<BarChart3 className="size-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <BreakdownList
              title="Members by status"
              items={report.breakdowns.membersByStatus}
            />
            <BreakdownList
              title="Events by status"
              items={report.breakdowns.eventsByStatus}
            />
            <BreakdownList
              title="Events by category"
              items={report.breakdowns.eventsByCategory}
            />
            <BreakdownList
              title="News by status"
              items={report.breakdowns.newsByStatus}
            />
          </div>
        </OwnerPanel>
      </section>

      <section className="grid gap-4">
        <OwnerPanel title="Member Types" icon={<Users className="size-5" />}>
          <BreakdownList items={report.breakdowns.membersByType} />
        </OwnerPanel>
        <OwnerPanel
          title="Top Member Locations"
          icon={<Landmark className="size-5" />}
        >
          <BreakdownList items={report.breakdowns.topMemberLocations} />
        </OwnerPanel>
      </section>

      <section className="grid gap-4">
        <OwnerPanel
          title="Upcoming Events"
          icon={<CalendarDays className="size-5" />}
        >
          <EventList events={report.events.upcoming} />
        </OwnerPanel>
        <OwnerPanel
          title="Recent News Posts"
          icon={<FileText className="size-5" />}
        >
          <div className="space-y-3">
            {report.newsBlogs.length ? (
              report.newsBlogs.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{post.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      post.status === "PUBLISHED" ? "success" : "secondary"
                    }
                  >
                    {toTitleCase(post.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyLine>No posts in selected date range.</EmptyLine>
            )}
          </div>
        </OwnerPanel>
      </section>

      <OwnerPanel
        title="Financial Snapshot"
        icon={<Banknote className="size-5" />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <MiniReport
            title="Receipts"
            items={report.accounting.receipts.map((item) => ({
              id: item.id,
              label: item.name,
              meta: `${item.receiptNo} - ${formatDate(item.receiptDate)}`,
              amount: item.totalAmount,
            }))}
            empty="No receipts in range."
          />
          <MiniReport
            title="Receivables"
            items={report.accounting.receivables.map((item) => ({
              id: item.id,
              label: item.customer ?? item.invoiceNo ?? "Receivable",
              meta: `${item.status} - due ${formatDate(item.dueDate)}`,
              amount: item.balance,
            }))}
            empty="No receivables in range."
          />
          <MiniReport
            title="Payables"
            items={report.accounting.payables.map((item) => ({
              id: item.id,
              label: item.supplier ?? item.billNo ?? "Payable",
              meta: `${item.status} - due ${formatDate(item.dueDate)}`,
              amount: item.balance,
            }))}
            empty="No payables in range."
          />
        </div>
      </OwnerPanel>

      <OwnerPanel
        title="Ledger Movement"
        icon={<TrendingUp className="size-5" />}
      >
        <div className="space-y-3">
          {report.accounting.ledgerTransactions.length ? (
            report.accounting.ledgerTransactions.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.party} - {item.category}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {item.transactionNo} - {formatDate(item.transactionDate)} -{" "}
                    {toTitleCase(item.type)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-emerald-700">
                    +{currency.format(item.debit)}
                  </p>
                  <p className="font-semibold text-red-700">
                    -{currency.format(item.credit)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <EmptyLine>No ledger movement in selected date range.</EmptyLine>
          )}
        </div>
      </OwnerPanel>

      <OwnerPanel
        title="Events In Selected Range"
        icon={<CheckCircle2 className="size-5" />}
      >
        <EventList events={report.events.inRange} />
      </OwnerPanel>
    </div>
  );
}

function DateRangePicker({
  date,
  onSelect,
}: {
  date: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">Date range</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 w-full justify-start px-3 font-normal sm:w-80"
          >
            <CalendarIcon className="size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ChangePinDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full justify-start px-3 font-normal sm:w-auto"
        >
          <Settings className="size-4" />
          Change PIN
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md!">
        <DialogHeader>
          <DialogTitle>Change owner PIN</DialogTitle>
          <DialogDescription>
            Enter current PIN and new 6-digit PIN. Session stays active after
            saving.
          </DialogDescription>
        </DialogHeader>
        <ChangePinForm />
      </DialogContent>
    </Dialog>
  );
}

function ChangePinForm() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const handleChangePin = async () => {
    setMessage(null);
    setError(null);

    if (currentPin.length !== 6 || newPin.length !== 6) {
      setError("Enter complete 6-digit current PIN and new PIN.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PIN and confirm PIN do not match.");
      return;
    }

    if (currentPin === newPin) {
      setError("New PIN must be different from current PIN.");
      return;
    }

    setIsSaving(true);

    try {
      await changeOwnerPin({ currentPin, newPin });
      resetForm();
      setMessage("PIN changed successfully. Use new PIN next time.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to change PIN.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-4">
          <PinField
            label="Current PIN"
            value={currentPin}
            onChange={setCurrentPin}
            disabled={isSaving}
          />
          <PinField
            label="New PIN"
            value={newPin}
            onChange={setNewPin}
            disabled={isSaving}
          />
          <PinField
            label="Confirm PIN"
            value={confirmPin}
            onChange={setConfirmPin}
            disabled={isSaving}
          />
        </div>
        <Button
          onClick={handleChangePin}
          disabled={isSaving}
          className="h-11 w-full sm:w-36"
        >
          {isSaving ? "Saving..." : "Save PIN"}
        </Button>
      </div>

      {message ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PinField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <InputOTP
        maxLength={6}
        value={value}
        onChange={(nextValue) => onChange(nextValue.replace(/\D/g, ""))}
        disabled={disabled}
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className="size-16.5" />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

function OwnerEventCalendar({
  month,
  events,
}: {
  month: Date;
  events: OwnerEventItem[];
}) {
  const days = buildCalendarDays(month);
  const eventMap = new Map<string, OwnerEventItem[]>();

  events.forEach((event) => {
    const key = toDateInputValue(new Date(event.startsAt));
    eventMap.set(key, [...(eventMap.get(key) ?? []), event]);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{format(month, "MMMM yyyy")}</p>
        <p className="text-muted-foreground text-sm">
          {numberFormat.format(events.length)} events in selected range
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = eventMap.get(toDateInputValue(day.date)) ?? [];

          return (
            <div
              key={day.key}
              className={cn(
                "min-h-24 rounded-md border bg-white p-2 text-left",
                !day.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                dayEvents.length && "border-emerald-200 bg-emerald-50/50",
              )}
            >
              <p className="text-sm font-semibold">{day.date.getDate()}</p>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="truncate rounded bg-[#145224] px-1.5 py-1 text-[11px] font-medium text-white"
                    title={event.name}
                  >
                    {event.name}
                  </div>
                ))}
                {dayEvents.length > 2 ? (
                  <p className="text-[11px] font-medium text-[#145224]">
                    +{dayEvents.length - 2} more
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BreakdownList({
  title,
  items,
}: {
  title?: string;
  items: Array<{ label: string; value: number }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-3 rounded-md border p-3">
      {title ? <p className="font-medium">{title}</p> : null}
      {items.length ? (
        items.map((item) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {toTitleCase(item.label)}
                </span>
                <span className="shrink-0 font-semibold">
                  {numberFormat.format(item.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#145224]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <EmptyLine>No data yet.</EmptyLine>
      )}
    </div>
  );
}

function OwnerMetricCard({
  title,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <Card className="rounded-lg bg-white">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="wrap-break-word text-2xl font-semibold tracking-tight">
            {value}
          </p>
          <p className="text-muted-foreground text-sm">{note}</p>
        </div>
        <div
          className={cn(
            "rounded-md p-2",
            tone === "green" && "bg-emerald-100 text-emerald-700",
            tone === "blue" && "bg-blue-100 text-blue-700",
            tone === "amber" && "bg-amber-100 text-amber-700",
            tone === "violet" && "bg-violet-100 text-violet-700",
            tone === "red" && "bg-red-100 text-red-700",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function OwnerPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg bg-white">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

function EventList({ events }: { events: OwnerEventItem[] }) {
  if (!events.length) {
    return <EmptyLine>No events to show.</EmptyLine>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto]"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{event.name}</p>
            <p className="text-muted-foreground text-sm">
              {formatDateTime(event.startsAt)}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {event.location}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <Badge variant="outline">{toTitleCase(event.status)}</Badge>
            <span className="text-muted-foreground text-sm">
              {numberFormat.format(event.attendeeCount)} attendees
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniReport({
  title,
  items,
  empty,
}: {
  title: string;
  items: Array<{ id: string; label: string; meta: string; amount: number }>;
  empty: string;
}) {
  return (
    <div className="rounded-md border">
      <div className="border-b px-3 py-2 font-medium">{title}</div>
      <div className="space-y-2 p-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {item.meta}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {currency.format(item.amount)}
              </p>
            </div>
          ))
        ) : (
          <EmptyLine>{empty}</EmptyLine>
        )}
      </div>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground py-3 text-sm">{children}</p>;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      key: date.toISOString(),
      date,
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
