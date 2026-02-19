"use client";

import { Heading } from "@/components/Heading";
import { useState, useMemo } from "react";
import { CurrentSessionCard } from './_components/CurrentSessionCard';
import { ActiveSessionsCard } from './_components/ActiveSessionCard';
import { Session, SessionInfo } from '@/types/session';

const Page = () => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tenDaysFromNow = new Date(now.getTime() + 248 * 60 * 60 * 1000)

  const session: SessionInfo = {
    id: "23",
    ipAddress: "123.253.50.156",
    createdAt: oneDayAgo.toISOString(),
    expiredAt: tenDaysFromNow.toISOString()
  }

  // Calculate dates once using useMemo to avoid impure function calls during render
  const mockSessionDates = useMemo(() => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      now: now.toISOString(),
      twoHoursAgo: twoHoursAgo.toISOString(),
      oneDayAgo: oneDayAgo.toISOString(),
    };
  }, []); // Empty dependency array means this only runs once

  // Mock sessions data - replace with actual API call
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Windows PC",
      browser: "Chrome on Windows",
      location: "Dasmariñas, Calabarzon, Philippines",
      ipAddress: "123.253.50.156",
      lastActive: mockSessionDates.now,
      signedIn: "January 13, 2026",
      isCurrent: true,
      coordinates: { lat: 14.3294, lng: 120.9367 },
    },
    {
      id: "2",
      device: "iPhone 15 Pro",
      browser: "Safari 17",
      location: "Manila, Metro Manila, Philippines",
      ipAddress: "192.168.1.2",
      lastActive: mockSessionDates.twoHoursAgo,
      signedIn: "January 12, 2026",
      isCurrent: false,
      coordinates: { lat: 14.5995, lng: 120.9842 },
    },
    {
      id: "3",
      device: "iPad Air",
      browser: "Safari 17",
      location: "Quezon City, Metro Manila, Philippines",
      ipAddress: "192.168.1.3",
      lastActive: mockSessionDates.oneDayAgo,
      signedIn: "January 10, 2026",
      isCurrent: false,
      coordinates: { lat: 14.6760, lng: 121.0437 },
    },
  ]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    // TODO: Add actual API call to revoke session
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    // TODO: Add actual API call to revoke all other sessions
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
