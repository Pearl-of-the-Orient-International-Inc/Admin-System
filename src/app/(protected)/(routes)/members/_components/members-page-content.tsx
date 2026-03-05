"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, ShieldCheck, Users, UserX } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportMembersButton } from "./import-members-button";
import { memberRecords, type MemberRecord } from "./members-data";
import { MembersDataTable } from "./members-data-table";

export function MembersPageContent() {
  const [members, setMembers] = useState<MemberRecord[]>(memberRecords);

  const totalMembers = members.length;
  const approvedMembers = useMemo(
    () => members.filter((member) => member.status === "Approved").length,
    [members]
  );
  const pendingMembers = useMemo(
    () => members.filter((member) => member.status === "Pending").length,
    [members]
  );
  const archivedMembers = useMemo(
    () => members.filter((member) => member.status === "Archived").length,
    [members]
  );
  const approvalRate = totalMembers
    ? Math.round((approvedMembers / totalMembers) * 100)
    : 0;

  const handleDeleteMembers = (memberIds: string[]) => {
    const ids = new Set(memberIds);
    setMembers((current) => current.filter((member) => !ids.has(member.id)));
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-muted-foreground text-sm">
            Manage member records and membership status.
          </p>
        </div>
        <ImportMembersButton />
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle>Member Summary</CardTitle>
          <CardDescription>Snapshot of current membership processing status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Total Members</p>
              <span className="rounded-md bg-blue-700/10 p-1.5 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300">
                <Users className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{totalMembers}</p>
            <p className="text-muted-foreground mt-1 text-xs">All recorded member profiles</p>
          </div>

          <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Approved</p>
              <span className="rounded-md bg-emerald-700/10 p-1.5 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{approvedMembers}</p>
            <p className="text-muted-foreground mt-1 text-xs">Fully endorsed members</p>
          </div>

          <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Pending</p>
              <span className="rounded-md bg-amber-700/10 p-1.5 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                <Clock3 className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{pendingMembers}</p>
            <p className="text-muted-foreground mt-1 text-xs">Awaiting review and validation</p>
          </div>

          <div className="rounded-lg border bg-card hover:border-primary p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium uppercase">Approval Rate</p>
              <span className="rounded-md bg-violet-700/10 p-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300">
                <ShieldCheck className="size-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold">{approvalRate}%</p>
            <p className="text-muted-foreground mt-1 text-xs">Approved vs total member records</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Members Directory</CardTitle>
          <CardDescription>
            View current members and application status with batch actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersDataTable data={members} onDeleteMembers={handleDeleteMembers} />
        </CardContent>
      </Card>
    </section>
  );
}
