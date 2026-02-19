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
import { IconKey } from "@tabler/icons-react";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CreateTokenDialog, type ApiToken } from "./CreateTokenDialog";

export const DeveloperTokensCard = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const handleCreate = (token: ApiToken) => {
    setTokens((prev) => [...prev, token]);
  };

  const handleRevoke = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    setRevokeId(null);
  };

  return (
    <div>
      <p>Personal access tokens</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              Personal access tokens are used to authenticate with the
              platform API for scripts, CI/CD, and third-party integrations.
            </p>
            <CreateTokenDialog onCreate={handleCreate} />
          </div>

          <div className="rounded-lg border overflow-hidden">
            {tokens.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader className="max-w-xl">
                  <EmptyMedia variant="icon">
                    <IconKey className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No API tokens</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    You have not created any personal access tokens yet. Create
                    one to authenticate API requests from scripts or apps.
                  </EmptyDescription>
                  <CreateTokenDialog
                    onCreate={handleCreate}
                    trigger={
                      <Button variant="outline" size="xs" className="mt-2">
                        <Plus className="size-3.5" />
                        Create new token
                      </Button>
                    }
                  />
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">Label</TableHead>
                    <TableHead className="p-4">Created at</TableHead>
                    <TableHead className="w-0 p-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="p-4 font-medium">
                        {token.label}
                      </TableCell>
                      <TableCell className="p-4 text-muted-foreground text-sm">
                        {token.createdAt
                          ? format(new Date(token.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          onClick={() => setRevokeId(token.id)}
                          variant="destructive"
                          size="xs"
                        >
                          <Trash2 className="size-3.5" />
                          Revoke token
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

      <AlertDialog
        open={revokeId !== null}
        onOpenChange={(open) => !open && setRevokeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke token?</AlertDialogTitle>
            <AlertDialogDescription>
              This token will stop working immediately. Any scripts or
              integrations using it will need a new token.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              size="xs"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => revokeId && handleRevoke(revokeId)}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
