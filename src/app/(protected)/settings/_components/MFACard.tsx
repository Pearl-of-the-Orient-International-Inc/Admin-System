"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDownIcon, ChevronUpIcon, SmartphoneIcon } from "lucide-react";
import {
  useCurrentUserQuery,
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useSetupTwoFactorMutation,
  toApiError,
} from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { SettingsCardSkeleton } from "./SettingsCardSkeleton";

export const MFACard = () => {
  const { toast } = useToast();
  const { data: currentUser, isLoading } = useCurrentUserQuery();
  const setupMutation = useSetupTwoFactorMutation();
  const enableMutation = useEnableTwoFactorMutation();
  const disableMutation = useDisableTwoFactorMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isManualKeyOpen, setIsManualKeyOpen] = useState(false);

  const isEnabled = Boolean(currentUser?.isTwoFactorEnabled);
  const setupData = setupMutation.data?.data;
  const dialogDescription = isEnabled
    ? "Two-step authentication is currently enabled for this account."
    : "Scan the QR code with your authenticator app, then enter the 6-digit code to turn it on.";

  useEffect(() => {
    const initializeSetup = async () => {
      if (!isOpen || isEnabled || setupMutation.isPending || setupData) return;

      try {
        await setupMutation.mutateAsync();
      } catch (error: unknown) {
        const apiError = toApiError(error);
        toast({
          title: "Setup failed",
          description:
            apiError.message ?? "Unable to initialize two-step authentication.",
          variant: "error",
        });
      }
    };

    void initializeSetup();
  }, [isOpen, isEnabled, setupMutation, setupData, toast]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setOtpCode("");
      setIsManualKeyOpen(false);
      setupMutation.reset();
    }
  };

  const handleEnable = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Code required",
        description:
          "Please enter the 6-digit code from your authenticator app.",
        variant: "error",
      });
      return;
    }

    try {
      await enableMutation.mutateAsync({ token: otpCode });
      toast({
        title: "Two-step authentication enabled",
        description: "Your account is now protected with an authenticator app.",
        variant: "success",
      });
      handleOpenChange(false);
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Enable failed",
        description:
          apiError.message ?? "Unable to enable two-step authentication.",
        variant: "error",
      });
    }
  };

  const handleDisable = async () => {
    try {
      await disableMutation.mutateAsync();
      toast({
        title: "Two-step authentication disabled",
        description: "Authenticator-based verification is now turned off.",
        variant: "success",
      });
      handleOpenChange(false);
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Disable failed",
        description:
          apiError.message ?? "Unable to disable two-step authentication.",
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return <SettingsCardSkeleton title="Two-step authentication" lines={1} />;
  }

  return (
    <div>
      <p>Two-step authentication</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <SmartphoneIcon className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm">Authenticator app</p>
                  <Badge variant={isEnabled ? "success" : "secondary"}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Increase security for your account with a time-based one-time
                  passcode from your authenticator app.
                </p>
              </div>
            </div>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="xs">
                  {isEnabled ? "Manage" : "Configure"}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Set up two-step authentication</DialogTitle>
                  <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                {!isEnabled ? (
                  <div className="space-y-5">
                    <div className="border rounded-md p-5 flex items-start gap-3">
                      <div className="size-10 relative flex items-center justify-center">
                        <Image src="/2fa.svg" alt="2FA" fill />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            Authenticator app
                          </p>
                          <Badge variant="success">Recommended</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use Google authenticator, Microsoft authenticator,
                          Authy, Duo, or any TOTP app.
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-semibold">
                        1. Set up authenticator app
                      </p>
                      {setupMutation.isPending && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Generating QR code...
                        </p>
                      )}
                      {setupData && (
                        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Scan the QR code, or manually enter this setup key
                              in your authenticator app. You can use Google
                              authenticator, Microsoft authenticator, Authy or
                              Duo. After you scan the QR code, you&apos;ll
                              receive a six-digit confirmation code to enter
                              below.
                            </p>
                            <Collapsible
                              className="mt-3"
                              open={isManualKeyOpen}
                              onOpenChange={setIsManualKeyOpen}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="text-white px-0! text-sm"
                                >
                                  Can&apos;t scan the QR code?
                                  {isManualKeyOpen ? (
                                    <ChevronUpIcon className="size-4" />
                                  ) : (
                                    <ChevronDownIcon className="size-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-3 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Enter this code into your authenticator app:
                                </p>
                                <code className="text-sm font-semibold inline-block break-all bg-accent px-2 py-1 rounded">
                                  {setupData.secret}
                                </code>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                          <Image
                            src={setupData.qrCodeDataUrl}
                            alt="Two-factor setup QR code"
                            width={144}
                            height={144}
                            unoptimized
                            className="h-36 w-36 rounded border bg-white p-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      <p className="text-sm font-semibold">2. Enter code</p>
                      <p className="text-xs text-muted-foreground">
                        Enter the 6-digit code generated by your authenticator
                        app.
                      </p>
                      <Input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        type="number"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium">
                      Authenticator app is active
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can turn this off if you no longer want to use
                      two-step authentication.
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  {!isEnabled ? (
                    <Button
                      size="sm"
                      onClick={handleEnable}
                      disabled={
                        setupMutation.isPending || enableMutation.isPending
                      }
                    >
                      {enableMutation.isPending ? "Turning on..." : "Turn on"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDisable}
                      disabled={disableMutation.isPending}
                    >
                      {disableMutation.isPending
                        ? "Turning off..."
                        : "Turn off"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
