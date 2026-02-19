"use client";

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
import { X } from "lucide-react";

type RestrictUserConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Display name for the user to restrict (e.g. username, email, or "johndoe"). */
  userDisplay: string | null;
  onConfirm: () => void;
};

const preventList = [
  "placing or managing orders in any store in this workspace",
  "listing or editing products and services",
  "leaving reviews or ratings",
  "accessing seller or vendor dashboards",
  "sending or receiving messages with other users",
  "joining or creating store followings and notifications",
];

const additionallyList = [
  "open new stores or become a seller in this workspace",
  "participate in disputes or refund requests",
  "use promotions, vouchers, or loyalty tied to this workspace",
];

export const RestrictUserConfirmDialog = ({
  open,
  onOpenChange,
  userDisplay,
  onConfirm,
}: RestrictUserConfirmDialogProps) => {
  const display = userDisplay?.trim() || "this user";
  const label = display.includes("@") ? display : `@${display}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Restrict user</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to restrict: <span className="font-medium text-foreground">{label}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 text-left text-sm">
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">
              Restricting a user prevents the following in this workspace:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {preventList.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <X className="size-3.5 shrink-0 text-destructive mt-0.5" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">
              Additionally, restricted users cannot:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {additionallyList.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <X className="size-3.5 shrink-0 text-destructive mt-0.5" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <AlertDialogFooter className="sm:flex-row gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
          >
            Restrict user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
