"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Key, X, EyeIcon, EyeOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useChangePasswordMutation,
  toApiError,
  useCurrentUserQuery,
  useResendEmailVerificationMutation,
  useVerifyPasswordMutation,
} from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoginCard = () => {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUserQuery();
  const resendVerificationMutation = useResendEmailVerificationMutation();
  const verifyPasswordMutation = useVerifyPasswordMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isOldPasswordVerified, setIsOldPasswordVerified] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);

  const email = currentUser?.email ?? "No email available";
  const isEmailVerified = Boolean(currentUser?.isEmailVerified);

  const handleResendVerification = async () => {
    if (!currentUser?.email) {
      toast({
        title: "Email not available",
        description: "Cannot send verification because no email was found.",
        variant: "error",
      });
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync({ email: currentUser.email });
      toast({
        title: "Verification sent",
        description: "Please check your inbox for the verification link.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Verification failed",
        description: apiError.message ?? "Unable to resend verification email.",
        variant: "error",
      });
    }
  };

  const resetChangePasswordState = () => {
    setIsOldPasswordVerified(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsOldPasswordVisible(false);
    setIsNewPasswordVisible(false);
    setIsConfirmNewPasswordVisible(false);
  };

  const handleVerifyOldPassword = async () => {
    if (!oldPassword.trim()) {
      toast({
        title: "Current password required",
        description: "Please enter your current password first.",
        variant: "error",
      });
      return;
    }

    try {
      await verifyPasswordMutation.mutateAsync({ oldPassword });
      setIsOldPasswordVerified(true);
      toast({
        title: "Password verified",
        description: "Now enter your new password.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Verification failed",
        description: apiError.message ?? "Current password is incorrect.",
        variant: "error",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!isOldPasswordVerified) {
      toast({
        title: "Verify current password",
        description: "Please verify your current password first.",
        variant: "error",
      });
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      toast({
        title: "Password required",
        description: "Please enter and confirm your new password.",
        variant: "error",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm password must match new password.",
        variant: "error",
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword,
        password: newPassword,
        confirmPassword: confirmNewPassword,
      });

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "success",
      });

      setIsChangePasswordOpen(false);
      resetChangePasswordState();
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Change password failed",
        description: apiError.message ?? "Unable to update password.",
        variant: "error",
      });
    }
  };

  const handlePrimaryPasswordAction = async () => {
    if (!isOldPasswordVerified) {
      await handleVerifyOldPassword();
      return;
    }

    await handleChangePassword();
  };

  const isPrimaryPasswordPending =
    !isOldPasswordVerified
      ? verifyPasswordMutation.isPending
      : changePasswordMutation.isPending;

  return (
    <div>
      <p>Login</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-8">
          {/* Email Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <Mail className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm">Email</p>
                  <Badge variant={isEmailVerified ? "success" : "warning"}>
                    {isEmailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your account is currently linked to{" "}
                  <b className="underline">{email}</b>.
                  Update the email used to log into your account.
                </p>
              </div>
            </div>
            {!isEmailVerified && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleResendVerification}
                disabled={resendVerificationMutation.isPending}
              >
                {resendVerificationMutation.isPending ? "Sending..." : "Verify"}
              </Button>
            )}
          </div>

          {/* Password Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <Key className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm">Password</h3>
                <p className="text-xs text-muted-foreground">
                  Choose or update a password to log into your account.
                </p>
              </div>
            </div>
            <Dialog
              open={isChangePasswordOpen}
              onOpenChange={(open) => {
                setIsChangePasswordOpen(open);
                if (!open) resetChangePasswordState();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="xs">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Verify your current password before setting a new one.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={isOldPasswordVisible ? "text" : "password"}
                        placeholder="Enter current password"
                        className="pr-9"
                        value={oldPassword}
                        onChange={(event) => setOldPassword(event.target.value)}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={() =>
                          setIsOldPasswordVisible((prevState) => !prevState)
                        }
                        className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                      >
                        {isOldPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                        <span className="sr-only">
                          {isOldPasswordVisible
                            ? "Hide current password"
                            : "Show current password"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {isOldPasswordVerified && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={isNewPasswordVisible ? "text" : "password"}
                            placeholder="Enter new password"
                            className="pr-9"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                          />
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon"
                            onClick={() =>
                              setIsNewPasswordVisible((prevState) => !prevState)
                            }
                            className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                          >
                            {isNewPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                            <span className="sr-only">
                              {isNewPasswordVisible
                                ? "Hide new password"
                                : "Show new password"}
                            </span>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">
                          Confirm new password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmNewPassword"
                            type={
                              isConfirmNewPasswordVisible ? "text" : "password"
                            }
                            placeholder="Confirm new password"
                            className="pr-9"
                            value={confirmNewPassword}
                            onChange={(event) =>
                              setConfirmNewPassword(event.target.value)
                            }
                          />
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon"
                            onClick={() =>
                              setIsConfirmNewPasswordVisible(
                                (prevState) => !prevState,
                              )
                            }
                            className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                          >
                            {isConfirmNewPasswordVisible ? (
                              <EyeOffIcon />
                            ) : (
                              <EyeIcon />
                            )}
                            <span className="sr-only">
                              {isConfirmNewPasswordVisible
                                ? "Hide confirm password"
                                : "Show confirm password"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsChangePasswordOpen(false);
                      resetChangePasswordState();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePrimaryPasswordAction}
                    disabled={isPrimaryPasswordPending}
                    size="sm"
                  >
                    {isPrimaryPasswordPending
                      ? isOldPasswordVerified
                        ? "Updating..."
                        : "Verifying..."
                      : isOldPasswordVerified
                        ? "Update password"
                        : "Verify current password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Google Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">Google</span>
                  <Badge variant="success">Configured</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set up a single sign-on with Google and login with one click.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              <X className="size-3.5" />
              Unlink
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
