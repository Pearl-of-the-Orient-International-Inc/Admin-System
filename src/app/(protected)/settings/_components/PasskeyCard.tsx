"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRoundIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  toApiError,
  useCurrentUserQuery,
  usePasskeyRegistrationOptionsMutation,
  usePasskeyRegistrationVerifyMutation,
  usePasskeyStatusQuery,
} from "@/features/auth/auth.hooks";

export const PasskeyCard = () => {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUserQuery();
  const { data: passkeyStatus } = usePasskeyStatusQuery();
  const registrationOptionsMutation = usePasskeyRegistrationOptionsMutation();
  const registrationVerifyMutation = usePasskeyRegistrationVerifyMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isCreating =
    registrationOptionsMutation.isPending || registrationVerifyMutation.isPending;
  const isPasskeyConfigured = Boolean(passkeyStatus?.hasPasskey);

  const handleCreatePasskey = async () => {
    if (!currentUser?.id || !currentUser?.email) {
      toast({
        title: "Session required",
        description: "Please sign in first before creating a passkey.",
        variant: "error",
      });
      return;
    }

    try {
      const registrationPayload = await registrationOptionsMutation.mutateAsync({
        label: "Primary passkey",
      });

      const credential = await startRegistration({
        optionsJSON: registrationPayload.options as Parameters<
          typeof startRegistration
        >[0]["optionsJSON"],
      });

      await registrationVerifyMutation.mutateAsync({
        response: credential,
      });

      setIsDialogOpen(false);

      toast({
        title: "Passkey created",
        description: "Your passkey was registered successfully.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Passkey creation failed",
        description:
          apiError.message ??
          "Your device could not complete passkey creation. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <div>
      <p>Passkey</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <KeyRoundIcon className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm">Passkey authentication</p>
                  <Badge variant={isPasskeyConfigured ? "success" : "secondary"}>
                    {isPasskeyConfigured ? "Configured" : "Not configured"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a passkey so your browser/device can verify your identity
                  with biometrics, PIN, or hardware key.
                </p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="xs">
                  {isPasskeyConfigured ? "Create another" : "Create passkey"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a passkey</DialogTitle>
                  <DialogDescription>
                    Next, your browser or device will prompt you to create a
                    passkey.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreatePasskey} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Continue"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
