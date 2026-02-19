"use client";

import { useState } from "react";
import { Heading } from "@/components/Heading";
import { SmtpConfigCard } from "./_components/SmtpConfigCard";

const Page = () => {
  const [provider, setProvider] = useState("smtp");
  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState("");
  const [encryption, setEncryption] = useState("ssl");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  return (
    <div>
      <Heading
        title="Email settings"
        description="Configure SMTP for sending transactional and system emails."
      />

      <div className="space-y-10 mt-10">
        <SmtpConfigCard
          provider={provider}
          host={host}
          port={port}
          encryption={encryption}
          email={email}
          appPassword={appPassword}
          onProviderChange={setProvider}
          onHostChange={setHost}
          onPortChange={setPort}
          onEncryptionChange={setEncryption}
          onEmailChange={setEmail}
          onAppPasswordChange={setAppPassword}
        />
      </div>
    </div>
  );
};

export default Page;
