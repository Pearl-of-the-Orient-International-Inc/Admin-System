"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { toApiError, useVerifyEmailMutation } from "@/features/auth/auth.hooks";
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
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        description: apiError.message ?? "Invalid or expired verification link.",
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

        {!hasToken && (
          <FieldDescription className="text-red-600 dark:text-red-500">
            This link is missing a token. Please request a new verification email.
          </FieldDescription>
        )}
      </FieldGroup>
    </div>
  );
}
