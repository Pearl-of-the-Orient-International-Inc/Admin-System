/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { Check, LoaderCircle, Lock, Search, UserPlus2 } from "lucide-react";

import { useMembersQuery } from "@/features/members/member.hooks";
import {
  useEventAttendeesQuery,
  useInviteEventAttendeesMutation,
} from "@/features/events/event.hooks";
import { toApiError } from "@/lib/http-client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type EventInviteAttendeesDialogProps = {
  eventId: string;
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventInviteAttendeesDialog({
  eventId,
  eventName,
  open,
  onOpenChange,
}: EventInviteAttendeesDialogProps) {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const membersQuery = useMembersQuery(
    {
      limit: 100,
      includeArchived: false,
    },
  );
  const attendeesQuery = useEventAttendeesQuery(eventId, open);
  const inviteMutation = useInviteEventAttendeesMutation();

  const invitedMemberIds = useMemo(
    () => new Set((attendeesQuery.data ?? []).map((attendee) => attendee.memberId)),
    [attendeesQuery.data],
  );

  const filteredMembers = useMemo(() => {
    const search = searchValue.trim().toLowerCase();
    const members = membersQuery.data?.data ?? [];

    if (!search) return members;

    return members.filter((member) => {
      const fullName =
        `${member.firstName} ${member.lastName}`.trim().toLowerCase();
      return (
        fullName.includes(search) ||
        member.user.email.toLowerCase().includes(search) ||
        member.user.name.toLowerCase().includes(search)
      );
    });
  }, [membersQuery.data?.data, searchValue]);

  const toggleMember = (memberId: string) => {
    if (invitedMemberIds.has(memberId)) return;

    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const handleInvite = async () => {
    if (!selectedMemberIds.length) return;

    try {
      await inviteMutation.mutateAsync({
        eventId,
        memberIds: selectedMemberIds,
      });
      setSelectedMemberIds([]);
      toast({
        title: "Attendees invited",
        description: "Selected members have been invited successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Invite failed",
        description:
          toApiError(error).message ||
          "Unable to invite attendees right now.",
        variant: "error",
      });
    }
  };

  const isLoading = membersQuery.isLoading || attendeesQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl gap-0 overflow-hidden border-border/70 bg-card p-0"
      >
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-left text-lg">Share</DialogTitle>
          <DialogDescription className="text-left">
            Invite current members to {eventName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-4 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Email or member name"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={handleInvite}
              disabled={!selectedMemberIds.length || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <UserPlus2 className="size-4" />
              )}
              Invite
            </Button>
          </div>

          <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-muted-foreground flex min-h-32 items-center justify-center gap-2 text-sm">
                <LoaderCircle className="size-4 animate-spin" />
                Loading current members...
              </div>
            ) : filteredMembers.length ? (
              filteredMembers.map((member) => {
                const fullName = `${member.firstName} ${member.lastName}`.trim();
                const isInvited = invitedMemberIds.has(member.id);
                const isSelected = selectedMemberIds.includes(member.id);

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    disabled={isInvited}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-accent disabled:cursor-default disabled:hover:bg-transparent",
                      isSelected && "bg-accent",
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-foreground">
                      {member.user.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={fullName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        fullName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{fullName}</p>
                        {isInvited ? (
                          <Badge variant="secondary">Invited</Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Full access
                      </span>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {isSelected ? <Check className="size-3" /> : null}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No members matched your search.
              </div>
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground">
              General access
            </p>
            <div className="flex items-center gap-3 rounded-xl border bg-background/60 px-4 py-3">
              <div className="rounded-xl bg-accent p-2">
                <Lock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Only people invited</p>
                <p className="text-sm text-muted-foreground">
                  Current invited members will retain full access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
