"use client";

import { useState } from "react";
import { Heading } from "@/components/Heading";
import { RestrictedUsersIntroCard } from "./_components/RestrictedUsersIntroCard";
import { RestrictUserFormCard } from "./_components/RestrictUserFormCard";
import { RestrictUserConfirmDialog } from "./_components/RestrictUserConfirmDialog";
import {
  AllRestrictedUsersCard,
  type RestrictedUser,
} from "./_components/AllRestrictedUsersCard";

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function RestrictedUsersPage() {
  const [warnPriorActivity] = useState(true);
  const [restrictedUsers, setRestrictedUsers] = useState<RestrictedUser[]>([]);
  const [isRestricting, setIsRestricting] = useState(false);
  const [pendingUser, setPendingUser] = useState<string | null>(null);

  const handleRequestRestrict = (query: string) => {
    setPendingUser(query.trim() || null);
  };

  const handleConfirmRestrict = () => {
    if (!pendingUser) return;
    handleRestrict(pendingUser);
    setPendingUser(null);
  };

  const handleRestrict = (query: string) => {
    setIsRestricting(true);
    // Simulate lookup then add; in production you would call an API to resolve and restrict
    setTimeout(() => {
      const id = `ru_${Date.now()}`;
      setRestrictedUsers((prev) => [
        ...prev,
        {
          id,
          email: `${query.replace(/\s+/g, ".").toLowerCase()}@example.com`,
          fullName: query,
          username: query.replace(/\s+/g, "").toLowerCase().slice(0, 12),
          restrictedAt: formatDate(new Date()),
          priorRole: warnPriorActivity ? "tenant" : undefined,
        },
      ]);
      setIsRestricting(false);
    }, 400);
  };

  const handleUnrestrict = (id: string) => {
    setRestrictedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="p-10">
      <Heading
        title="Restricted users"
        description="Restrict users to deny access to ministry records, seminary tools, worship administration, and other platform features in this workspace."
      />

      <div className="space-y-10 mt-10">
        <RestrictedUsersIntroCard />
        <RestrictUserFormCard
          onRestrict={handleRequestRestrict}
          isRestricting={isRestricting}
        />
        <RestrictUserConfirmDialog
          open={!!pendingUser}
          onOpenChange={(open) => !open && setPendingUser(null)}
          userDisplay={pendingUser}
          onConfirm={handleConfirmRestrict}
        />
        <AllRestrictedUsersCard
          users={restrictedUsers}
          onUnrestrict={handleUnrestrict}
        />
      </div>
    </div>
  );
}
