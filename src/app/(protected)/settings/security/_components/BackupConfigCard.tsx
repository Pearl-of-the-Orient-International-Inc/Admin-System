"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
export const BackupConfigCard = () => {
  const [enabled, setEnabled] = useState(true);
  const [schedule, setSchedule] = useState<"daily" | "weekly">("daily");
  const [retentionDays, setRetentionDays] = useState("30");
  const [encryptBackups, setEncryptBackups] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <p>Database backup</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure automated backups for your database. Backups
            include user data, events, organization and platform configuration. Restore
            points are retained according to the policy below.
          </p>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium">Automated backups</Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, the platform will create database backups on the
                  schedule you choose. Disable to manage backups externally.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={enabled} onCheckedChange={setEnabled} />
                <span className="text-xs text-muted-foreground">
                  {enabled ? "On" : "Off"}
                </span>
              </div>
            </div>

            {enabled && (
              <>
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs">Schedule</Label>
                  <Select
                    value={schedule}
                    onValueChange={(v: "daily" | "weekly") => setSchedule(v)}
                  >
                    <SelectTrigger className="w-full max-w-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Daily backups run at 02:00 UTC. Weekly backups run on Sunday
                    at 02:00 UTC.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Retention (days)</Label>
                  <Input
                    type="number"
                    min={7}
                    max={365}
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                    className="w-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep backup snapshots for this many days (7–365). Older
                    backups are automatically removed.
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 pt-5 border-t">
                  <div className="flex-1 space-y-1">
                    <Label className="text-sm">Encrypt backups</Label>
                    <p className="text-xs text-muted-foreground">
                      Store backups encrypted at rest. Recommended for
                      compliance and user data protection.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={encryptBackups}
                      onCheckedChange={setEncryptBackups}
                    />
                    <span className="text-xs text-muted-foreground">
                      {encryptBackups ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button size="xs" onClick={handleSave} disabled={saved}>
              <Save className="size-3.5" />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
