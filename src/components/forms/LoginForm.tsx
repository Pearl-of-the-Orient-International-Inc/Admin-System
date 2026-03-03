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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation, toApiError } from "@/features/auth/auth.hooks";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { toast } = useToast();
  const loginMutation = useLoginMutation();

  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({
        email,
        password,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      });

      toast({
        title: "Login successful",
        description: "Welcome back.",
        variant: "success"
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

  return (
    <form className={cn("flex flex-col gap-10", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
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
      </FieldGroup>
    </form>
  );
}
