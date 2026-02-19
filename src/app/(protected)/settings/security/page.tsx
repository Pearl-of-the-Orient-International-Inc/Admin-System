"use client";

import { Heading } from "@/components/Heading";
import { IpVisibilityCard } from "./_components/IpVisibilityCard";
import { IpBlockingCard } from "./_components/IpBlockingCard";
import { SensitiveDataPoliciesCard } from "./_components/SensitiveDataPoliciesCard";
import { AuditLogCard } from "./_components/AuditLogCard";
import { BackupConfigCard } from "./_components/BackupConfigCard";

const Page = () => {
  return (
    <div>
      <Heading
        title="Security & Privacy"
        description="Manage IP visibility, blocking rules, sensitive data policies, audit logs, and database backups for your workspace."
      />

      <div className="space-y-10 mt-10">
        <IpVisibilityCard />
        <IpBlockingCard />
        <SensitiveDataPoliciesCard />
        <AuditLogCard />
        <BackupConfigCard />
      </div>
    </div>
  );
};

export default Page;
