 "use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  toApiError,
  useDeleteCurrentUserMutation,
  useLogoutMutation,
} from "@/features/auth/auth.hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const AccountActionCard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const logoutMutation = useLogoutMutation();
  const deleteCurrentUserMutation = useDeleteCurrentUserMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Signed out",
        description: "Your session has been closed.",
        variant: "info",
      });
      router.replace("/");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Sign out failed",
        description: apiError.message ?? "Unable to sign out right now.",
        variant: "error",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteCurrentUserMutation.mutateAsync();
      toast({
        title: "Account deleted",
        description: "Your account and session were removed successfully.",
        variant: "success",
      });
      router.replace("/");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Delete account failed",
        description: apiError.message ?? "Unable to delete your account right now.",
        variant: "error",
      });
    }
  };

  return (
    <div>
      <p>Account actions</p>
      <Card className="bg-transparent border-destructive mt-4">
        <CardContent className="space-y-8">
          {/* Sign out Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-1">
                <p className="text-sm">Sign out</p>
                <p className="text-xs text-muted-foreground">
                  You can safely sign out from the current session and choose to
                  sign back in later.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handleLogout}
              disabled={logoutMutation.isPending || deleteCurrentUserMutation.isPending}
            >
              <LogOutIcon className="size-3" />
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>

          {/* Delete Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-1">
                <p className="text-sm">Delete account</p>
                <p className="text-xs text-muted-foreground">
                  By deleting your personal account, you delete all associated
                  data. Think before acting, there&apos;s no turning back!
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="xs"
                  disabled={deleteCurrentUserMutation.isPending || logoutMutation.isPending}
                >
                  {deleteCurrentUserMutation.isPending
                    ? "Deleting..."
                    : "Delete account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <AlertTriangleIcon className="size-8" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is permanent and cannot be undone. All account data
                    associated with this user will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteCurrentUserMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={deleteCurrentUserMutation.isPending}
                    onClick={handleDeleteAccount}
                  >
                    {deleteCurrentUserMutation.isPending
                      ? "Deleting..."
                      : "Yes, delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
