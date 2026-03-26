"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatSystemLogActionType,
  formatSystemLogDate,
  formatSystemLogResult,
} from "@/features/system-logs/system-log.utils";
import type { SystemLogRecord } from "@/features/system-logs/system-log.types";

type SystemLogDetailsSheetProps = {
  log: SystemLogRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SystemLogDetailsSheet({
  log,
  open,
  onOpenChange,
}: SystemLogDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        {log ? (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle>Activity details</SheetTitle>
              <SheetDescription>
                Review the action, actor, module, and timestamp for this record.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-11">
                    <AvatarImage src={log.actorAvatar ?? ""} />
                    <AvatarFallback>{log.actorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium">{log.actorName}</p>
                    <p className="text-muted-foreground text-sm">{log.actorEmail}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard label="Action" value={log.actionLabel} />
                <DetailCard
                  label="Action Type"
                  value={formatSystemLogActionType(log.actionType)}
                />
                <DetailCard label="Module" value={log.moduleLabel} />
                <DetailCard label="Target" value={log.targetLabel} />
                <DetailCard
                  label="Timestamp"
                  value={formatSystemLogDate(log.timestamp)}
                />
                <DetailCard label="IP Address" value={log.ipAddress} />
                <DetailCard label="Device" value={log.deviceLabel} />
                <div className="space-y-2 rounded-xl border bg-card p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Result
                  </p>
                  <Badge variant={getResultVariant(log.result)}>
                    {formatSystemLogResult(log.result)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border bg-card p-4">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Description
                </p>
                <p className="text-sm leading-relaxed">{log.description}</p>
              </div>

              {log.metadata?.length ? (
                <div className="space-y-3 rounded-xl border bg-card p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Metadata
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {log.metadata.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      <p className="text-muted-foreground text-xs font-medium uppercase">{label}</p>
      <p className="text-sm font-medium leading-relaxed">{value}</p>
    </div>
  );
}

function getResultVariant(result: SystemLogRecord["result"]) {
  if (result === "SUCCESS") return "success";
  if (result === "WARNING") return "warning";
  return "error";
}
