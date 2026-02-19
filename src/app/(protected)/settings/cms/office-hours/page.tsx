"use client";

import { Heading } from "@/components/Heading";
import { OfficeHoursCard } from "./_components/OfficeHoursCard";

const Page = () => {
  return (
    <div>
      <Heading
        title="Office hours"
        description="Define when your office is open so people know when to reach you."
      />

      <div className="space-y-10 mt-10">
        <OfficeHoursCard />
      </div>
    </div>
  );
};

export default Page;

