"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { GoPasskeyFill } from "react-icons/go";
import { DotIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { useToast } from "@/hooks/use-toast";
import {
  useCurrentUserQuery,
  useLoginMutation,
  usePasskeyAuthenticationOptionsMutation,
  usePasskeyAuthenticationVerifyMutation,
  useVerifyTwoFactorMutation,
  toApiError,
} from "@/features/auth/auth.hooks";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { toast } = useToast();
  const loginMutation = useLoginMutation();
  const passkeyOptionsMutation = usePasskeyAuthenticationOptionsMutation();
  const passkeyVerifyMutation = usePasskeyAuthenticationVerifyMutation();
  const verifyTwoFactorMutation = useVerifyTwoFactorMutation();
  const { data: currentUser } = useCurrentUserQuery();

  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    router.replace("/dashboard");
  }, [currentUser, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
        userAgent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : undefined,
      });

      if (response.mfaRequired && response.mfaToken) {
        setRequiresMfa(true);
        setMfaToken(response.mfaToken);

        toast({
          title: "Two-factor required",
          description: "Enter the 6-digit code from your authenticator app.",
          variant: "info",
        });
        return;
      }

      toast({
        title: "Login successful",
        description: "Welcome back.",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const apiError = toApiError(error);

      if (apiError.requiresVerification) {
        toast({
          title: "Email verification required",
          description: apiError.message ?? "Please verify your email first.",
          variant: "warning",
        });
        return;
      }

      toast({
        title: "Login failed",
        description: apiError.message ?? "Invalid credentials",
        variant: "error",
      });
    }
  };

  const handleVerifyTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otpCode.length !== 6 || !mfaToken) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit authentication code.",
        variant: "error",
      });
      return;
    }

    try {
      await verifyTwoFactorMutation.mutateAsync({
        mfaToken,
        token: otpCode,
        userAgent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : undefined,
      });

      toast({
        title: "Login successful",
        description: "Welcome back.",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Verification failed",
        description: apiError.message ?? "Invalid authentication code.",
        variant: "error",
      });
    }
  };

  const handlePasskeyLogin = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Enter your email to continue with passkey login.",
        variant: "error",
      });
      return;
    }

    try {
      const optionsPayload = await passkeyOptionsMutation.mutateAsync({ email });

      const credential = await startAuthentication({
        optionsJSON: optionsPayload.options as Parameters<
          typeof startAuthentication
        >[0]["optionsJSON"],
      });

      await passkeyVerifyMutation.mutateAsync({
        email,
        response: credential,
        userAgent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : undefined,
      });

      toast({
        title: "Login successful",
        description: "Welcome back.",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Passkey login failed",
        description: apiError.message ?? "Unable to login with passkey.",
        variant: "error",
      });
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-10", className)}
      {...props}
      onSubmit={requiresMfa ? handleVerifyTwoFactor : handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            {requiresMfa
              ? "Two-factor authentication"
              : "Login to your account"}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {requiresMfa
              ? "Enter the 6-digit code from your authenticator app."
              : "Enter your email below to login to your account"}
          </p>
        </div>
        {!requiresMfa ? (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="juan.delacruz@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={isVisible ? "text" : "password"}
                  placeholder="Password"
                  className="pr-9"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  onClick={() => setIsVisible((prevState) => !prevState)}
                  className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                >
                  {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                  <span className="sr-only">
                    {isVisible ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </Field>
            <Field>
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Login"}
              </Button>
            </Field>
            <FieldSeparator>Or continue with</FieldSeparator>
            <Field>
              <Button
                variant="outline"
                type="button"
                onClick={handlePasskeyLogin}
                disabled={
                  passkeyOptionsMutation.isPending || passkeyVerifyMutation.isPending
                }
              >
                <GoPasskeyFill className="size-4" />
                {passkeyOptionsMutation.isPending || passkeyVerifyMutation.isPending
                  ? "Processing..."
                  : "Login with Passkey"}
              </Button>
              <Button variant="outline" type="button">
                <FcGoogle className="size-4" />
                Login with Google
              </Button>
              <FieldDescription className="text-center [&>a:hover]:text-white!">
                Don&apos;t have an account?{" "}
                <a
                  href="mailto:developer.pearlchaplaincy@gmail.com"
                  className="underline underline-offset-4"
                >
                  Contact the Developer
                </a>
              </FieldDescription>
            </Field>
          </>
        ) : (
          <>
            <Field className="space-y-3">
              <FieldLabel htmlFor="otp">Authentication code</FieldLabel>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot className="size-17" index={0} />
                  <InputOTPSlot className="size-17" index={1} />
                  <InputOTPSlot className="size-17" index={2} />
                </InputOTPGroup>
                <div role="separator" className="text-muted-foreground">
                  <DotIcon />
                </div>
                <InputOTPGroup>
                  <InputOTPSlot className="size-17" index={3} />
                  <InputOTPSlot className="size-17" index={4} />
                  <InputOTPSlot className="size-17" index={5} />
                </InputOTPGroup>
              </InputOTP>
            </Field>
            <Field className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRequiresMfa(false);
                  setMfaToken("");
                  setOtpCode("");
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={verifyTwoFactorMutation.isPending}
              >
                {verifyTwoFactorMutation.isPending
                  ? "Verifying..."
                  : "Verify & Login"}
              </Button>
            </Field>
          </>
        )}
      </FieldGroup>
    </form>
  );
}
