"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download, Eye, FileQuestion, MessageSquareWarning, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { GlobalDataTable } from "@/components/DataTable";
import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSurveyFeedbackResponsesQuery } from "@/features/survey-feedback/survey-feedback.hooks";
import type { SurveyFeedbackResponse } from "@/features/survey-feedback/survey-feedback.types";
import { toApiError } from "@/lib/http-client";

const average = (response: SurveyFeedbackResponse) => (response.welcomeRating + response.accessibilityRating + response.satisfactionRating) / 3;
const csvValue = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function exportAll(responses: SurveyFeedbackResponse[]) {
  const headers = ["Submitted at", "Name", "Respondent type", "Discovery source", "Improvement areas", "Welcome rating", "Accessibility rating", "Satisfaction rating", "Average rating", "Feedback", "Reported issue", "Issue category", "Issue description", "Contact email"];
  const rows = responses.map((response) => [response.createdAt, response.respondentName ?? "Anonymous", response.respondentType, response.discoverySource, response.improvementAreas.join("; "), response.welcomeRating, response.accessibilityRating, response.satisfactionRating, average(response).toFixed(2), response.feedback, response.hasIssue ? "Yes" : "No", response.issueCategory ?? "", response.issueDescription ?? "", response.contactEmail ?? ""].map(csvValue).join(","));
  const blob = new Blob([[headers.map(csvValue).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `survey-responses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SurveyResponsesPageContent() {
  const query = useSurveyFeedbackResponsesQuery();
  const [selected, setSelected] = useState<SurveyFeedbackResponse | null>(null);
  const responses = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const issueCount = responses.filter((response) => response.hasIssue).length;
  const overallAverage = responses.length ? responses.reduce((sum, response) => sum + average(response), 0) / responses.length : 0;
  const columns = useMemo<ColumnDef<SurveyFeedbackResponse>[]>(() => [
    { accessorKey: "createdAt", header: "Submitted", cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy h:mm a") },
    { accessorKey: "respondentName", header: "Respondent", cell: ({ row }) => <div><p className="font-medium">{row.original.respondentName || "Anonymous"}</p><p className="text-muted-foreground text-xs">{row.original.respondentType}</p></div> },
    { accessorKey: "satisfactionRating", header: "Average rating", cell: ({ row }) => <span className="flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" />{average(row.original).toFixed(2)}</span> },
    { accessorKey: "hasIssue", header: "Issue report", cell: ({ row }) => row.original.hasIssue ? <Badge variant="destructive">Issue reported</Badge> : <Badge variant="secondary">None</Badge> },
  ], []);

  return <section className="space-y-6 p-10">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">Survey Responses</h1><p className="text-muted-foreground mt-1 text-sm">Review community feedback, issue reports, satisfaction ratings, and export a CSV report.</p></div><Button variant="outline" disabled={!responses.length} onClick={() => exportAll(responses)}><Download className="size-4" />Export all CSV</Button></div>
    <div className="grid gap-4 md:grid-cols-3"><SummaryStatCard label="Total responses" value={responses.length} description="Submitted feedback records" icon={<FileQuestion className="size-4" />} accentClassName="bg-blue-700/10 text-blue-700" /><SummaryStatCard label="Average rating" value={overallAverage.toFixed(2)} description="Across all satisfaction statements" icon={<Star className="size-4" />} accentClassName="bg-amber-700/10 text-amber-700" /><SummaryStatCard label="Issue reports" value={issueCount} description="Responses requiring review" icon={<MessageSquareWarning className="size-4" />} accentClassName="bg-red-700/10 text-red-700" /></div>
    <Card className="bg-transparent"><CardHeader className="border-b"><CardTitle>Community Feedback</CardTitle><CardDescription>The active survey uses the public access rule. Select a response to view every answer.</CardDescription></CardHeader><CardContent>{query.isLoading ? <PageLoadingState mode="table" /> : query.isError ? <PageErrorState title="Unable to load survey responses" description={toApiError(query.error).message ?? "Survey responses could not be loaded."} backUrl="/dashboard" backLabel="Back to dashboard" /> : <GlobalDataTable columns={columns} data={responses} filterPlaceholder="Search survey responses..." emptyMessage="No survey responses have been submitted yet." exportFileName="survey-responses" cellAction={(row) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="size-4" />Review</Button>} />}</CardContent></Card>
    <ResponseSheet response={selected} onOpenChange={(open) => !open && setSelected(null)} />
  </section>;
}

function ResponseSheet({ response, onOpenChange }: { response: SurveyFeedbackResponse | null; onOpenChange: (open: boolean) => void }) {
  return <Sheet open={Boolean(response)} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>Survey response</SheetTitle><SheetDescription>Submitted answers and any associated issue report.</SheetDescription></SheetHeader>{response ? <div className="space-y-5 p-5"><div className="grid gap-3 rounded-lg border p-4"><Detail label="Submitted" value={format(new Date(response.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")} /><Detail label="Respondent" value={`${response.respondentName || "Anonymous"} · ${response.respondentType}`} /><Detail label="How they found us" value={response.discoverySource} /><Detail label="Improvement areas" value={response.improvementAreas.join(", ")} /></div><div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"><Detail label="Welcomed and cared for" value={`${response.welcomeRating}/5`} /><Detail label="Services are accessible" value={`${response.accessibilityRating}/5`} /><Detail label="Overall satisfaction" value={`${response.satisfactionRating}/5`} /><Detail label="Average" value={`${average(response).toFixed(2)}/5`} /></div><div className="rounded-lg border p-4"><Detail label="Written feedback" value={response.feedback} /></div>{response.hasIssue ? <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4"><Badge variant="destructive">Issue reported</Badge><Detail label="Category" value={response.issueCategory || "Not specified"} /><Detail label="Description" value={response.issueDescription || "Not provided"} /><Detail label="Follow-up email" value={response.contactEmail || "Not provided"} /></div> : <div className="rounded-lg border p-4 text-sm text-muted-foreground">No issue was reported with this response.</div>}</div> : null}</SheetContent></Sheet>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-muted-foreground text-xs font-medium uppercase">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm">{value}</p></div>;
}
