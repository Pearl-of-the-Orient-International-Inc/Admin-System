"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExternalLink } from "lucide-react";

export const IpVisibilityCard = () => {
  const [visibleInDashboard, setVisibleInDashboard] = useState(true);
  const [visibleInLogs, setVisibleInLogs] = useState(true);

  return (
    <div>
      <p>IP address visibility</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            IP addresses may be considered personal information under certain data
            protection laws. Choose whether to display or hide IP addresses in
            the Admin Dashboard and in user logs.
          </p>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-sm">
                  IP addresses are currently{" "}
                  {visibleInDashboard ? "visible" : "hidden"} in the Admin
                  Dashboard.
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disabling this will hide IP addresses in the dashboard. After
                  disabling, they will no longer appear in firewall data,
                  observability, or monitoring queries.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={visibleInDashboard}
                  onCheckedChange={setVisibleInDashboard}
                />
                <span className="text-xs text-muted-foreground">
                  {visibleInDashboard ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 pt-4 border-t">
              <div className="flex-1 space-y-1">
                <Label className="text-sm">
                  IP addresses are currently{" "}
                  {visibleInLogs ? "visible" : "hidden"} in user
                  logs.
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hide IP addresses from log drains and tenant activity logs by
                  disabling this setting.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={visibleInLogs}
                  onCheckedChange={setVisibleInLogs}
                />
                <span className="text-xs text-muted-foreground">
                  {visibleInLogs ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            For more information, visit our{" "}
            <a
              href="#"
              className="font-medium text-foreground underline underline-offset-4 inline-flex items-center gap-1 hover:no-underline"
            >
              Privacy notice
              <ExternalLink className="size-3" />
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
