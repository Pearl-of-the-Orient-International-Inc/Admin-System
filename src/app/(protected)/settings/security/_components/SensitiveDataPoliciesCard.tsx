"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ExternalLink, Save } from "lucide-react";

export const SensitiveDataPoliciesCard = () => {
  const [enforceSensitive, setEnforceSensitive] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <p>Sensitive data policies</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Enforce policies for how API keys, payment credentials, and other
            sensitive environment variables are created and edited in this
            workspace.
          </p>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium">
                  Enforce sensitive environment variables
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, environment variables created by members of this
                  workspace for event management, API keys, or webhook secrets
                  will be stored as sensitive and only decrypted at runtime by
                  the platform. This reduces exposure in logs and user config
                  views.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={enforceSensitive}
                  onCheckedChange={setEnforceSensitive}
                />
                <span className="text-xs text-muted-foreground">
                  {enforceSensitive ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <a
              href="#"
              className="text-xs text-foreground font-medium underline underline-offset-4 inline-flex items-center gap-1 hover:no-underline"
            >
              Learn more about sensitive data policies
              <ExternalLink className="size-3" />
            </a>
            <Button
              size="xs"
              onClick={handleSave}
              disabled={saved}
            >
              <Save className='size-3.5' />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
