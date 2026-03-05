"use client";

import { Heading } from "@/components/Heading";
import { PoliciesCard } from "./_components/PoliciesCard";

const Page = () => {
  return (
    <div className="p-10">
      <Heading
        title="Policies"
        description="Manage legal, ministry, and governance policies for your seminary, worship, and chaplaincy organization."
      />

      <div className="space-y-10 mt-10">
        <PoliciesCard />
      </div>
    </div>
  );
};

export default Page;
