"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authStore } from "@/lib/auth-store";
import { useCurrentUserQuery, useLogoutMutation } from "@/features/auth/auth.hooks";

export function SessionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const hasTriggeredRef = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const logoutMutation = useLogoutMutation();
  const { isError, error } = useCurrentUserQuery();

  useEffect(() => {
    if (!isError || hasTriggeredRef.current) return;

    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status !== 401 && status !== 403) return;

    hasTriggeredRef.current = true;
    setIsRedirecting(true);

    toast({
      title: "Session expired",
      description: "You have been logged out. Please sign in again.",
      variant: "error",
    });

    void (async () => {
      try {
        await logoutMutation.mutateAsync();
      } catch {
        authStore.clear();
      } finally {
        router.replace("/");
      }
    })();
  }, [error, isError, logoutMutation, router, toast]);

  if (isRedirecting) return null;

  return <>{children}</>;
}
