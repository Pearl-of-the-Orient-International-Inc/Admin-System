"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { memberRecords, type MemberRecord } from "../../_components/members-data";
import { PendingMembersDataTable } from "./pending-members-data-table";

export function PendingMembersPageContent() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<MemberRecord[]>(
    memberRecords.filter((member) => member.status === "Pending")
  );
  const [approvedCount, setApprovedCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineTargetId, setDeclineTargetId] = useState<string | null>(null);

  const pendingCount = applications.length;

  const handleApprove = (memberId: string) => {
    const member = applications.find((item) => item.id === memberId);
    if (!member) return;

    setApplications((current) => current.filter((item) => item.id !== memberId));
    setApprovedCount((current) => current + 1);
    toast({
      variant: "success",
      title: "Application approved",
      description: `${member.fullName} has been approved.`,
    });
  };

  const handleRequestDecline = (memberId: string) => {
    setDeclineTargetId(memberId);
    setDeclineReason("");
    setDeclineDialogOpen(true);
  };

  const handleDecline = () => {
    if (!declineTargetId || !declineReason.trim()) return;
    const member = applications.find((item) => item.id === declineTargetId);
    if (!member) return;

    setApplications((current) => current.filter((item) => item.id !== declineTargetId));
    setDeclinedCount((current) => current + 1);
    toast({
      variant: "warning",
      title: "Application declined",
      description: `${member.fullName}'s application has been declined. Reason: ${declineReason.trim()}`,
    });
    setDeclineDialogOpen(false);
    setDeclineReason("");
    setDeclineTargetId(null);
  };

  return (
    <section className="space-y-6 p-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pending Applications
        </h1>
        <p className="text-muted-foreground text-sm">
          Review submitted member applications and decide to approve or decline.
        </p>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>Snapshot of current review queue and decisions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 hover:border-primary shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Pending</p>
              <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                <Clock3 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{pendingCount}</p>
            <p className="text-muted-foreground mt-1 text-xs">Applications awaiting review</p>
          </div>

          <div className="rounded-lg border bg-card p-4 hover:border-primary shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Approved (Session)</p>
              <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{approvedCount}</p>
            <p className="text-muted-foreground mt-1 text-xs">Approved during this review session</p>
          </div>

          <div className="rounded-lg border bg-card p-4 hover:border-primary shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Declined (Session)</p>
              <span className="rounded-md bg-rose-700/10 p-1.5 text-rose-700 dark:bg-rose-300/10 dark:text-rose-300">
                <XCircle className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{declinedCount}</p>
            <p className="text-muted-foreground mt-1 text-xs">Declined during this review session</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>
            Use the action buttons per row to approve or decline applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingMembersDataTable
            data={applications}
            onApprove={handleApprove}
            onRequestDecline={handleRequestDecline}
          />
        </CardContent>
      </Card>

      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this membership application?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason before declining this application.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="decline-reason">Reason for declining</Label>
            <Textarea
              id="decline-reason"
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              placeholder="State why the application is being declined..."
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeclineTargetId(null);
                setDeclineReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason.trim()}
            >
              Confirm Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
