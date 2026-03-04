"use client";

import { Heading } from "@/components/Heading";
import { useMemo, useState } from "react";
import { CurrentSessionCard } from "./_components/CurrentSessionCard";
import { ActiveSessionsCard } from "./_components/ActiveSessionCard";
import { BackendSession, Session, SessionInfo } from "@/types/session";
import {
  toApiError,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
  useUserSessionsQuery,
} from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";

const Page = () => {
  const { toast } = useToast();
  const [, setSelectedSession] = useState<Session | null>(null);
  const sessionsQuery = useUserSessionsQuery();
  const revokeSessionMutation = useRevokeSessionMutation();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();

  const mapBackendSessionToUI = (session: BackendSession): Session => {
    const userAgent = session.userAgent ?? "Unknown Device";
    const [browserName = "Unknown Browser", ...deviceParts] =
      userAgent.split(" on ");

    const deviceName =
      deviceParts.length > 0 ? deviceParts.join(" on ") : "Unknown Device";

    return {
      id: session.id,
      device: deviceName,
      browser: browserName,
      location: session.location.label,
      ipAddress: session.ipAddress ?? "Unknown IP",
      lastActive: session.createdAt,
      createdAt: session.createdAt,
      expiredAt: session.expiredAt,
      signedIn: new Date(session.createdAt).toLocaleString(),
      isCurrent: session.isCurrent,
      coordinates: session.location.coordinates ?? undefined,
    };
  };

  const session: SessionInfo = useMemo(() => {
    const currentSession = sessionsQuery.data?.currentSession;

    if (!currentSession) return {};

    return {
      id: currentSession.id,
      ipAddress: currentSession.ipAddress ?? "Unknown IP",
      createdAt: currentSession.createdAt,
      expiredAt: currentSession.expiredAt,
    };
  }, [sessionsQuery.data?.currentSession]);

  const sessions: Session[] = useMemo(
    () => (sessionsQuery.data?.sessions ?? []).map(mapBackendSessionToUI),
    [sessionsQuery.data?.sessions],
  );

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast({
        title: "Session revoked",
        description: "The selected device has been signed out.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Failed to revoke session",
        description: apiError.message ?? "Unable to revoke session right now.",
        variant: "error",
      });
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await revokeOtherSessionsMutation.mutateAsync();
      toast({
        title: "Other sessions revoked",
        description: "All sessions except your current one were signed out.",
        variant: "success",
      });
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Failed to revoke other sessions",
        description: apiError.message ?? "Unable to complete this action right now.",
        variant: "error",
      });
    }
  };

  return (
    <div>
      <Heading
        title="Session Settings"
        description="Monitor and manage your active sessions across all devices."
      />

      <div className="space-y-10 mt-10">
        <CurrentSessionCard session={session} />

        <ActiveSessionsCard
          sessions={sessions}
          onRevokeSession={handleRevokeSession}
          onRevokeAllOthers={handleRevokeAllOtherSessions}
          onSelectSession={setSelectedSession}
        />
      </div>
    </div>
  );
};

export default Page;
