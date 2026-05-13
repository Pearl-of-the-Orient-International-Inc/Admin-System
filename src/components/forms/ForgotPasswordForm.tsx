"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  toApiError,
  useForgotPasswordMutation,
} from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await forgotPasswordMutation.mutateAsync({ email: normalizedEmail });
      toast({
        title: "Reset email sent",
        description: "Check your inbox for the password reset link.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      const isMissingRoute = apiError.code === "UNKNOWN_ERROR" && /404/i.test(apiError.message ?? "");
      toast({
        title: "Request failed",
        description: isMissingRoute
          ? "Forgot password API route was not found. Check the admin API base URL and make sure the correct backend is running."
          : (apiError.message ?? "Unable to process forgot password request."),
        variant: "error",
      });
    }
  };

  return (
    <form className={cn("flex flex-col gap-10", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your admin email and we&apos;ll send a reset link.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="admin@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>

        <Field>
          <Button type="submit" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remembered your password?{" "}
          <Link href="/" className="underline underline-offset-4">
            Back to login
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
