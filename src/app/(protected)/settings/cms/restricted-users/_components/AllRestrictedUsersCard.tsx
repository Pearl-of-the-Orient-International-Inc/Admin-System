"use client";

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
import { RefreshCcw, UserX } from "lucide-react";

export type RestrictedUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  restrictedAt: string;
  priorRole?: "seller" | "buyer" | "tenant";
};

type AllRestrictedUsersCardProps = {
  users: RestrictedUser[];
  onUnrestrict: (id: string) => void;
};

export const AllRestrictedUsersCard = ({
  users,
  onUnrestrict,
}: AllRestrictedUsersCardProps) => {
  return (
    <div>
      <p>All restricted users</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          {users.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader className='max-w-xl'>
                <EmptyMedia variant="icon">
                  <UserX className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>You have not restricted any users</EmptyTitle>
                <EmptyDescription className='text-xs'>
                  When you restrict someone, they will appear here. Restricting
                  denies access to any features in this workspace, so use it carefully. You can restrict a user by searching for them in the form above.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='p-4'>User</TableHead>
                    <TableHead className='p-4'>Email</TableHead>
                    <TableHead className='p-4'>Restricted</TableHead>
                    <TableHead className="w-0 p-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className='p-4'>
                        <div>
                          <p className="text-sm font-medium">
                            {u.fullName || u.username}
                          </p>
                          {(u.username || u.priorRole) && (
                            <p className="text-xs text-muted-foreground">
                              @{u.username}
                              {u.priorRole && ` · Prior ${u.priorRole}`}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm p-4 text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell className="p-4 text-muted-foreground">
                        {u.restrictedAt}
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => onUnrestrict(u.id)}
                        >
                          <RefreshCcw className='size-3.5' />
                          Unrestrict
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
