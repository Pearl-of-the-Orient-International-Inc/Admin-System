"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  toApiError,
  useResendEmailVerificationMutation,
  useVerifyEmailMutation,
} from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";

type VerifyStatus = "idle" | "verifying" | "success" | "error";

export function ConfirmAccountForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const hasToken = token.length > 0;

  const { toast } = useToast();
  const verifyMutation = useVerifyEmailMutation();
  const resendVerificationMutation = useResendEmailVerificationMutation();
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");

  const statusText = useMemo(() => {
    if (status === "verifying") return "Verifying your account...";
    if (status === "success") return "Your account has been verified successfully.";
    if (status === "error") return errorMessage ?? "Unable to verify account.";
    return "Ready to verify your account.";
  }, [errorMessage, status]);

  const verifyAccount = async () => {
    if (!hasToken) {
      setStatus("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    try {
      setStatus("verifying");
      setErrorMessage(null);
      await verifyMutation.mutateAsync({ code: token });
      setStatus("success");
      toast({
        title: "Account verified",
        description: "You can now login using your account.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      setStatus("error");
      setErrorMessage(apiError.message ?? "Verification failed.");
      toast({
        title: "Verification failed",
        description:
          apiError.message ?? "Invalid verification link. Request a new email.",
        variant: "error",
      });
    }
  };

  const resendVerification = async () => {
    const email = resendEmail.trim().toLowerCase();
    if (!email) {
      setErrorMessage("Enter your email to resend verification.");
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync({ email });
      setErrorMessage(null);
      toast({
        title: "Verification email sent",
        description: `A new verification link was sent to ${email}.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      setStatus("error");
      setErrorMessage(apiError.message ?? "Unable to resend verification email.");
      toast({
        title: "Resend failed",
        description: apiError.message ?? "Unable to resend verification email.",
        variant: "error",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-10", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Confirm Account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            We are confirming your email verification token.
          </p>
        </div>

        <FieldDescription
          className={cn(
            "text-sm",
            status === "success" && "text-green-600 dark:text-green-500",
            status === "error" && "text-red-600 dark:text-red-500",
          )}
        >
          {statusText}
        </FieldDescription>

        <div className="flex items-center gap-3">
          {status !== "success" && (
            <Button
              type="button"
              onClick={verifyAccount}
              disabled={verifyMutation.isPending || !hasToken}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify account"}
            </Button>
          )}

          <Button asChild variant={status === "success" ? "default" : "outline"}>
            <Link href="/">Back to login</Link>
          </Button>
        </div>

        {(status === "error" || !hasToken) && (
          <div className="space-y-3 rounded-lg border p-4">
            <FieldDescription>
              Need a new verification email? Enter your registered email address.
            </FieldDescription>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
                placeholder="name@example.com"
                disabled={resendVerificationMutation.isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={resendVerification}
                disabled={resendVerificationMutation.isPending}
              >
                {resendVerificationMutation.isPending
                  ? "Sending..."
                  : "Resend email"}
              </Button>
            </div>
          </div>
        )}
      </FieldGroup>
    </div>
  );
}
