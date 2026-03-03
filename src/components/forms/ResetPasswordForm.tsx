"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toApiError, useResetPasswordMutation } from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const hasToken = token.length > 0;

  const { toast } = useToast();
  const resetPasswordMutation = useResetPasswordMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const passwordsMatch = useMemo(
    () => password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasToken) {
      toast({
        title: "Invalid reset link",
        description: "Missing reset token. Please request a new link.",
        variant: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password must match.",
        variant: "error",
      });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        password,
        confirmPassword,
        token,
      });
      toast({
        title: "Password updated",
        description: "You can now login with your new password.",
        variant: "success",
      });
      router.push("/");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Reset failed",
        description: apiError.message ?? "Unable to reset password.",
        variant: "error",
      });
    }
  };

  return (
    <form className={cn("flex flex-col gap-10", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your new password and confirm it to continue.
          </p>
        </div>

        {!hasToken && (
          <FieldDescription className="text-red-500">
            Missing or invalid token. Please request a new reset link.
          </FieldDescription>
        )}

        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter new password"
              className="pr-9"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Button
              variant="ghost"
              type="button"
              size="icon"
              onClick={() => setIsPasswordVisible((prevState) => !prevState)}
              className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            >
              {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              <span className="sr-only">
                {isPasswordVisible ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm new password"
              className="pr-9"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <Button
              variant="ghost"
              type="button"
              size="icon"
              onClick={() => setIsConfirmPasswordVisible((prevState) => !prevState)}
              className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            >
              {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              <span className="sr-only">
                {isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
              </span>
            </Button>
          </div>
        </Field>

        {password.length > 0 && confirmPassword.length > 0 && !passwordsMatch && (
          <FieldDescription className="text-red-500">
            Passwords do not match.
          </FieldDescription>
        )}

        <Field>
          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending || !hasToken}
          >
            {resetPasswordMutation.isPending ? "Updating..." : "Update password"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          <Link href="/" className="underline underline-offset-4">
            Back to login
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
