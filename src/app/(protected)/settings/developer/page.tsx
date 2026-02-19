"use client";

import { Heading } from "@/components/Heading";
import { DeveloperApiKeysCard } from "./_components/DeveloperApiKeysCard";
import { DeveloperTokensCard } from "./_components/DeveloperTokensCard";
import { DeveloperWebhooksCard } from "./_components/DeveloperWebhooksCard";

const Page = () => {
  return (
    <div>
      <Heading
        title="Developer"
        description="API keys, personal access tokens, and webhooks for integrating your platform with external apps and scripts."
      />

      <div className="space-y-10 mt-10">
        <DeveloperApiKeysCard />
        <DeveloperTokensCard />
        <DeveloperWebhooksCard />
      </div>
    </div>
  );
};

export default Page;
