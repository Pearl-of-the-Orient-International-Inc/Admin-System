"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarCheck, Check, Clock3, Eye, X } from "lucide-react";
import { useMemo, useState } from "react";
import { GlobalDataTable } from "@/components/DataTable";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  useChaplainServiceBookingsQuery,
  useUpdateChaplainServiceBookingFinancialsMutation,
  useUpdateChaplainServiceBookingStatusMutation,
} from "@/features/chaplain-services/chaplain-service.hooks";
import type {
  ChaplainServiceBookingRecord,
  ChaplainServiceBookingStatus,
} from "@/features/chaplain-services/chaplain-service.types";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";

const providerName = (booking: ChaplainServiceBookingRecord) =>
  [
    booking.providerMember.firstName,
    booking.providerMember.middleInitial,
    booking.providerMember.lastName,
    booking.providerMember.extensionName,
  ]
    .filter(Boolean)
    .join(" ");

const statusVariant = (status: ChaplainServiceBookingStatus) => {
  if (status === "CONFIRMED" || status === "COMPLETED") return "default" as const;
  if (status === "REJECTED" || status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
};

const statusLabel = (status: ChaplainServiceBookingStatus) =>
  status === "AWAITING_CHAPLAIN_APPROVAL"
    ? "Awaiting chaplain approval"
    : status.replaceAll("_", " ");

export function BookingRequestsSection() {
  const query = useChaplainServiceBookingsQuery();
  const [selected, setSelected] = useState<ChaplainServiceBookingRecord | null>(null);
  const bookings = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const columns = useMemo<ColumnDef<ChaplainServiceBookingRecord>[]>(
    () => [
      {
        accessorKey: "requesterName",
        header: "Requester",
        cell: ({ row }) => (
          <div><p className="font-medium">{row.original.requesterName}</p><p className="text-muted-foreground text-xs">{row.original.requesterEmail}</p></div>
        ),
      },
      { accessorKey: "service.name", header: "Service", cell: ({ row }) => row.original.service.name },
      { id: "provider", header: "Chaplain", cell: ({ row }) => providerName(row.original) },
      { accessorKey: "preferredAt", header: "Schedule", cell: ({ row }) => format(new Date(row.original.preferredAt), "MMM d, yyyy h:mm a") },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{statusLabel(row.original.status)}</Badge> },
    ],
    [],
  );

  return (
    <>
      <Card className="bg-transparent">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><CalendarCheck className="size-5" />Booking Requests</CardTitle>
          <CardDescription>Monitor submitted requests and confirm them when authorized. Chaplains can also approve requests assigned to them from their profile portal.</CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? <PageLoadingState mode="table" /> : query.isError ? (
            <PageErrorState title="Unable to load booking requests" description={toApiError(query.error).message ?? "Booking requests could not be loaded."} backUrl="/dashboard" backLabel="Back to dashboard" />
          ) : (
            <GlobalDataTable
              columns={columns}
              data={bookings}
              filterPlaceholder="Search booking requests..."
              emptyMessage="No booking requests have been submitted yet."
              exportFileName="chaplain-service-bookings"
              cellAction={(row) => (
                <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="size-4" />Review</Button>
              )}
            />
          )}
        </CardContent>
      </Card>
      <BookingReviewSheet key={selected?.id ?? "closed"} booking={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}

function BookingReviewSheet({ booking, onOpenChange }: { booking: ChaplainServiceBookingRecord | null; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const mutation = useUpdateChaplainServiceBookingStatusMutation();
  const financialMutation = useUpdateChaplainServiceBookingFinancialsMutation();
  const [reason, setReason] = useState("");
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [serviceFee, setServiceFee] = useState(booking?.providerServiceFee?.toString() ?? "");
  const [paymentStatus, setPaymentStatus] = useState(booking?.requesterPaymentStatus ?? "NOT_REQUIRED");
  const [commissionStatus, setCommissionStatus] = useState(booking?.providerCommissionStatus ?? "NOT_APPLICABLE");

  const update = async (status: "AWAITING_CHAPLAIN_APPROVAL" | "RESCHEDULED" | "REJECTED" | "COMPLETED" | "CANCELLED") => {
    if (!booking) return;
    if ((status === "REJECTED" || status === "CANCELLED") && !reason.trim()) {
      toast({ variant: "error", title: "Reason required", description: "Enter a reason before rejecting or cancelling this request." });
      return;
    }
    if (status === "RESCHEDULED" && (!reason.trim() || !rescheduleAt)) {
      toast({ variant: "error", title: "Schedule and reason required", description: "Choose the new date and time and explain the change." });
      return;
    }
    try {
      await mutation.mutateAsync({ id: booking.id, payload: { status, reason: reason.trim() || undefined, preferredAt: status === "RESCHEDULED" ? new Date(rescheduleAt).toISOString() : undefined } });
      toast({ variant: "success", title: "Booking updated", description: `The request is now ${status.toLowerCase()}.` });
      onOpenChange(false);
      setReason("");
    } catch (error) {
      toast({ variant: "error", title: "Unable to update booking", description: toApiError(error).message });
    }
  };

  const saveFinancials = async () => {
    if (!booking) return;
    const fee = serviceFee.trim() ? Number(serviceFee) : null;
    if (fee !== null && (!Number.isFinite(fee) || fee < 0)) {
      toast({ variant: "error", title: "Invalid service fee", description: "Enter a valid amount or leave it blank." });
      return;
    }
    try {
      await financialMutation.mutateAsync({ id: booking.id, payload: { providerServiceFee: fee, requesterPaymentStatus: paymentStatus, providerCommissionStatus: commissionStatus } });
      toast({ variant: "success", title: "Financial status updated", description: "Payment and provider commission records were saved." });
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "error", title: "Unable to save financials", description: toApiError(error).message });
    }
  };

  return (
    <Sheet open={Boolean(booking)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>Review booking request</SheetTitle><SheetDescription>Review the requester, schedule, delivery details, and current history.</SheetDescription></SheetHeader>
        {booking ? <div className="space-y-5 p-5">
          <div className="grid gap-3 rounded-lg border p-4 text-sm">
            <Detail label="Service" value={booking.service.name} />
            <Detail label="Chaplain" value={providerName(booking)} />
            <Detail label="Requester" value={`${booking.requesterName} · ${booking.requesterEmail} · ${booking.requesterPhone}`} />
            <Detail label="Schedule" value={format(new Date(booking.preferredAt), "EEEE, MMMM d, yyyy 'at' h:mm a")} />
            <Detail label="Delivery" value={`${booking.deliveryMethod.replaceAll("_", " ")} · ${booking.locationDetails}`} />
            <Detail label="Notes" value={booking.notes || "No supporting notes"} />
            <Detail label="Status" value={statusLabel(booking.status)} />
          </div>
          <div className="grid gap-2"><Label htmlFor="booking-action-reason">Reason or review note</Label><Textarea id="booking-action-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required when rejecting or cancelling" /></div>
          <div className="grid gap-2"><Label htmlFor="booking-reschedule-at">New schedule</Label><Input id="booking-reschedule-at" type="datetime-local" value={rescheduleAt} onChange={(event) => setRescheduleAt(event.target.value)} /></div>
          <div className="flex flex-wrap justify-end gap-2">
            {["PENDING", "AWAITING_CHAPLAIN_APPROVAL", "CONFIRMED"].includes(booking.status) ? <Button variant="outline" disabled={mutation.isPending} onClick={() => void update("RESCHEDULED")}><Clock3 className="size-4" />Reschedule</Button> : null}
            {booking.status === "PENDING" ? <>
              <Button variant="outline" disabled={mutation.isPending} onClick={() => void update("REJECTED")}><X className="size-4" />Reject</Button>
              <Button disabled={mutation.isPending} onClick={() => void update("AWAITING_CHAPLAIN_APPROVAL")}><Check className="size-4" />Confirm and send to chaplain</Button>
            </> : null}
            {booking.status === "AWAITING_CHAPLAIN_APPROVAL" ? (
              <Button variant="outline" disabled={mutation.isPending} onClick={() => void update("CANCELLED")}>Cancel request</Button>
            ) : null}
            {booking.status === "CONFIRMED" ? <>
              <Button variant="outline" disabled={mutation.isPending} onClick={() => void update("CANCELLED")}>Cancel booking</Button>
              <Button disabled={mutation.isPending} onClick={() => void update("COMPLETED")}>Mark completed</Button>
            </> : null}
          </div>
          <div className="space-y-4 rounded-lg border p-4">
            <div><h3 className="font-semibold">Payment and provider commission</h3><p className="text-muted-foreground text-xs">The organization commission is charged to the chaplain, not the requester.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="provider-service-fee">Provider service fee</Label><Input id="provider-service-fee" type="number" min="0" step="0.01" value={serviceFee} onChange={(event) => setServiceFee(event.target.value)} placeholder="Leave blank when free" /></div>
              <div className="grid gap-2"><Label>Requester payment</Label><Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as typeof paymentStatus)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{["NOT_REQUIRED", "PENDING", "PAID", "FAILED", "REFUNDED"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2 sm:col-span-2"><Label>Provider commission</Label><Select value={commissionStatus} onValueChange={(value) => setCommissionStatus(value as typeof commissionStatus)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{["NOT_APPLICABLE", "PENDING", "SETTLED", "WAIVED"].map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-1 text-sm"><Detail label="Calculated commission" value={booking.providerCommissionAmount === null ? "Not applicable" : `₱${booking.providerCommissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /></div>
            <Button className="w-full" disabled={financialMutation.isPending} onClick={() => void saveFinancials()}>{financialMutation.isPending ? "Saving..." : "Save financial status"}</Button>
          </div>
          <div className="space-y-3 rounded-lg border p-4"><h3 className="font-semibold">Status history</h3>{booking.history.map((entry) => <div key={entry.id} className="border-l-2 border-[#032a0d] pl-3 text-sm"><p className="font-medium">{statusLabel(entry.status)}</p><p className="text-muted-foreground text-xs">{format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}{entry.reason ? ` · ${entry.reason}` : ""}</p></div>)}</div>
        </div> : null}
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-muted-foreground text-xs font-medium uppercase">{label}</p><p className="mt-1 whitespace-pre-wrap">{value}</p></div>;
}
