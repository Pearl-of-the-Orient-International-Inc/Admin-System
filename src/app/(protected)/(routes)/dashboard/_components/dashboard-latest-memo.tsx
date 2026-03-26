import { ArrowUpRight, FileText, Signature } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMemoHighlight } from "./dashboard-data";

export function DashboardLatestMemo({
  memo,
}: {
  memo: DashboardMemoHighlight;
}) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="border-b">
        <CardTitle>Latest memo</CardTitle>
        <CardDescription>
          Most recent document released from the memo and announcements flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="rounded-2xl border bg-[linear-gradient(135deg,rgba(20,82,36,0.10),transparent_60%)] p-5">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="outline">{memo.category}</Badge>
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileText className="size-4" />
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold leading-tight">{memo.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {memo.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Issued</span>
            <span className="font-medium">{memo.issuedAtLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Author</span>
            <span className="font-medium">{memo.author}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-background/70 p-4">
          <div className="flex items-center gap-2">
            <Signature className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Signatories</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {memo.signatories.map((signatory) => (
              <Badge key={signatory} variant="secondary" className="rounded-full">
                {signatory}
              </Badge>
            ))}
          </div>
        </div>

        <Button asChild className="w-full justify-between">
          <Link href="/memo-announcements">
            Open memo details
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
