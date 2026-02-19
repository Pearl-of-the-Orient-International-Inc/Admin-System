"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { IconShieldOff } from "@tabler/icons-react";
import { Trash2 } from "lucide-react";
import { CreateIpRuleDialog, type IpBlockRule } from "./CreateIpRuleDialog";
import { format } from "date-fns";

export const IpBlockingCard = () => {
  const [rules, setRules] = useState<IpBlockRule[]>([]);

  const handleAdd = (rule: Omit<IpBlockRule, "id" | "createdAt">) => {
    setRules((prev) => [
      ...prev,
      {
        ...rule,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <p>IP blocking</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              Configure the IP addresses and CIDRs that the platform should
              block requests from. Blocked requests will not reach your
              system or contribute to usage.
            </p>
            <CreateIpRuleDialog onAdd={handleAdd} />
          </div>

          <div className="rounded-lg border overflow-hidden">
            {rules.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader className="max-w-xl">
                  <EmptyMedia variant="icon">
                    <IconShieldOff className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No IP blocking rules</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    Your workspace has no IP blocking rules. Create a rule to
                    block specific IPs or CIDR ranges.
                  </EmptyDescription>
                  <CreateIpRuleDialog
                    onAdd={handleAdd}
                    trigger={
                      <Button variant="outline" size="xs" className="mt-2">
                        Create new rule
                      </Button>
                    }
                  />
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">Host</TableHead>
                    <TableHead className="p-4">IP address</TableHead>
                    <TableHead className="p-4">Note</TableHead>
                    <TableHead className="p-4">Created</TableHead>
                    <TableHead className="w-0 p-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="p-4 font-mono text-sm">
                        {rule.host || "*"}
                      </TableCell>
                      <TableCell className="p-4 font-mono text-sm">
                        {rule.ipAddress}
                      </TableCell>
                      <TableCell className="p-4 text-sm text-muted-foreground">
                        {rule.note || "—"}
                      </TableCell>
                      <TableCell className="p-4 text-sm text-muted-foreground">
                        {rule.createdAt
                          ? format(new Date(rule.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleRemove(rule.id)}
                        >
                          <Trash2 className="size-3.5" />
                          Remove rule
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
