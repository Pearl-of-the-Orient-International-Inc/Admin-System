"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock3, Eye, ScrollText, SearchCheck } from "lucide-react";
import { GlobalDataTable } from "@/components/DataTable";
import { PageLoadingState } from "@/components/PageLoadingState";
import { PageErrorState } from "@/components/PageErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useOrdinationApplicationsQuery, useReviewOrdinationApplicationMutation, type OrdinationApplication } from "@/features/ordination-applications/ordination-applications";
import { useToast } from "@/hooks/use-toast";
import { toApiError } from "@/lib/http-client";

const actions = [
  ["START_REVIEW", "Start review"], ["REQUEST_ADDITIONAL_INFORMATION", "Request information"], ["RETURN_FOR_CORRECTION", "Return for correction"], ["APPROVE", "Approve"], ["REJECT", "Reject"],
] as const;
const format = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export function OrdinationApplicationsPageContent() {
  const { toast } = useToast(); const query = useOrdinationApplicationsQuery(); const review = useReviewOrdinationApplicationMutation();
  const [selected, setSelected] = useState<OrdinationApplication | null>(null); const [action, setAction] = useState(""); const [notes, setNotes] = useState("");
  const columns = useMemo<ColumnDef<OrdinationApplication>[]>(() => [
    { id: "member", header: "Applicant", cell: ({ row }) => <div><p className="font-medium">{[row.original.member.firstName, row.original.member.middleInitial, row.original.member.lastName].filter(Boolean).join(" ")}</p><p className="text-muted-foreground text-xs">{row.original.member.user.email}</p></div> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "APPROVED" ? "success" : row.original.status === "REJECTED" ? "error" : "secondary"}>{format(row.original.status)}</Badge> },
    { accessorKey: "submittedAt", header: "Submitted", cell: ({ row }) => row.original.submittedAt ? new Date(row.original.submittedAt).toLocaleDateString() : "Draft" },
    { id: "documents", header: "Documents", cell: ({ row }) => row.original.documents.length },
  ], []);
  const submitReview = async () => { if (!selected || !action) return; try { const updated = await review.mutateAsync({ id: selected.id, action, notes: notes.trim() || undefined }); setSelected(updated); setAction(""); setNotes(""); toast({ title: "Review updated", variant: "success" }); } catch (error) { toast({ title: "Review update failed", description: toApiError(error).message, variant: "error" }); } };
  if (query.isLoading) return <PageLoadingState mode="table" />;
  if (query.isError) return <PageErrorState title="Unable to load ordination applications" description="Try again shortly." backUrl="/dashboard" backLabel="Back to dashboard" />;
  const data = query.data ?? [];
  const summary = [{ status: "SUBMITTED", icon: Clock3, tone: "bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300", label: "Awaiting review", note: "Submitted applications" }, { status: "UNDER_REVIEW", icon: SearchCheck, tone: "bg-sky-700/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-300", label: "In review", note: "Being evaluated" }, { status: "ADDITIONAL_INFORMATION_REQUIRED", icon: Clock3, tone: "bg-orange-700/10 text-orange-700 dark:bg-orange-300/10 dark:text-orange-300", label: "Action needed", note: "Awaiting applicant response" }, { status: "APPROVED", icon: CheckCircle2, tone: "bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300", label: "Approved", note: "Completed decisions" }];
  return <section className="space-y-6 p-10"><div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight">Ordination Applications</h1><p className="text-muted-foreground text-sm">Validate eligibility, review evidence, request corrections, and record decisions.</p></div>
    <Card className="overflow-hidden bg-transparent"><CardHeader className="border-b"><CardTitle>Application Summary</CardTitle><CardDescription>Snapshot of the ordination review queue and decisions.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{summary.map(({ status, icon: Icon, tone, label, note }) => <div key={status} className="rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-primary"><div className="mb-2 flex items-center justify-between"><p className="text-muted-foreground text-xs font-medium uppercase">{label}</p><span className={`rounded-md p-1.5 ${tone}`}><Icon className="size-4" /></span></div><p className="text-2xl font-semibold">{data.filter((item) => item.status === status).length}</p><p className="text-muted-foreground mt-1 text-xs">{note}</p></div>)}</CardContent></Card>
    <Card className="bg-transparent"><CardHeader className="border-b pb-4"><CardTitle>Review Queue</CardTitle><CardDescription>Open an application to inspect documents and record a review decision.</CardDescription></CardHeader><CardContent className="pt-6"><GlobalDataTable data={data} columns={columns} filterPlaceholder="Search applicant or status..." emptyMessage="No ordination applications found." exportFileName="ordination-applications" cellAction={(row) => <Button variant="ghost" size="icon-sm" onClick={() => setSelected(row.original)}><Eye className="size-4" /></Button>} /></CardContent></Card>
    <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>Ordination Application</SheetTitle><SheetDescription>Approval does not change account access or officer assignments.</SheetDescription></SheetHeader>{selected && <div className="space-y-6 px-4 pb-6">
      <div className="rounded-lg border p-4"><p className="font-semibold">{selected.member.firstName} {selected.member.lastName}</p><p className="text-sm text-muted-foreground">{selected.member.user.email} · {format(selected.eligibilityMemberType)}</p><Badge className="mt-2">{format(selected.status)}</Badge></div>
      {[["Ministry background", selected.ministryBackground], ["Calling statement", selected.callingStatement], ["Proposed ministry", selected.proposedMinistry], ["Additional information", selected.additionalInformation]].map(([label, value]) => value && <div key={label}><h3 className="font-medium">{label}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{value}</p></div>)}
      <div><h3 className="mb-2 font-medium">Supporting documents</h3><div className="space-y-2">{selected.documents.map((document) => <a key={`${document.type}-${document.fileUrl}`} href={document.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border p-3 text-sm hover:bg-muted"><ScrollText className="size-4" /><span className="flex-1">{format(document.type)}</span><span className="text-muted-foreground">{document.fileName}</span></a>)}</div></div>
      <div className="rounded-lg border p-4"><h3 className="font-medium">Decision</h3><div className="mt-3 space-y-3"><Select value={action} onValueChange={setAction}><SelectTrigger><SelectValue placeholder="Choose review action" /></SelectTrigger><SelectContent>{actions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Review notes or requested information" rows={4} /><Button className="w-full" disabled={!action || review.isPending} onClick={() => void submitReview()}>Save review decision</Button></div></div>
      {selected.reviews.length > 0 && <div><h3 className="mb-2 font-medium">Review history</h3><div className="space-y-2">{selected.reviews.map((item) => <div key={item.id} className="rounded border p-3 text-sm"><div className="flex justify-between"><span className="font-medium">{format(item.action)}</span><span className="text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span></div><p className="text-muted-foreground">{item.reviewer.name}</p>{item.notes && <p className="mt-2">{item.notes}</p>}</div>)}</div></div>}
    </div>}</SheetContent></Sheet>
  </section>;
}
