"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconMail } from "@tabler/icons-react";
import { AppPasswordHelpDialog } from "./AppPasswordHelpDialog";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

const ENCRYPTION_OPTIONS = [
  { value: "ssl", label: "SSL" },
  { value: "tls", label: "TLS" },
  { value: "none", label: "None" },
] as const;

type SmtpConfigCardProps = {
  provider: string;
  host: string;
  port: string;
  encryption: string;
  email: string;
  appPassword: string;
  onProviderChange: (value: string) => void;
  onHostChange: (value: string) => void;
  onPortChange: (value: string) => void;
  onEncryptionChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAppPasswordChange: (value: string) => void;
};

export const SmtpConfigCard = ({
  provider,
  host,
  port,
  encryption,
  email,
  appPassword,
  onProviderChange,
  onHostChange,
  onPortChange,
  onEncryptionChange,
  onEmailChange,
  onAppPasswordChange,
}: SmtpConfigCardProps) => {
  return (
    <div>
      <p>SMTP configuration</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start gap-4 mb-6">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconMail className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm">Outgoing mail server</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure SMTP settings for sending transactional and system
                emails.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm">Email provider</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                Mail delivery method. SMTP is the default for most providers.
              </p>
              <Select
                value={provider || undefined}
                onValueChange={onProviderChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm">Host</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                SMTP server hostname.
              </p>
              <Input
                value={host}
                onChange={(e) => onHostChange(e.target.value)}
                placeholder="smtp.gmail.com"
                disabled
              />
            </div>
            <div>
              <p className="text-sm">Port</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                SMTP port (e.g. 465 for SSL, 587 for TLS).
              </p>
              <Input
                type="text"
                inputMode="numeric"
                value={port}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*$/.test(v)) onPortChange(v);
                }}
                placeholder="465"
              />
            </div>
            <div>
              <p className="text-sm">Encryption</p>
              <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                Connection security. SSL is recommended for most providers.
              </p>
              <Select
                value={encryption || undefined}
                onValueChange={onEncryptionChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select encryption" />
                </SelectTrigger>
                <SelectContent>
                  {ENCRYPTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <p className="text-sm">Email</p>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  SMTP account email address used to send mail.
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="e.g. noreply@company.com"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm">App password</p>
                  <AppPasswordHelpDialog />
                </div>
                <p className="text-muted-foreground text-xs mb-2 mt-1.5">
                  Application-specific password. Do not use your regular account
                  password.
                </p>
                <Input
                  type="password"
                  autoComplete="off"
                  value={appPassword}
                  onChange={(e) => onAppPasswordChange(e.target.value)}
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>
          </div>
          <Button className="flex justify-end ml-auto mt-4" size="xs">
            <SaveIcon className="size-3.5" />
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
