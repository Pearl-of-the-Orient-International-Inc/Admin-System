"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";

export type IpBlockRule = {
  id: string;
  host: string;
  ipAddress: string;
  note: string;
  createdAt: string;
};

type CreateIpRuleDialogProps = {
  onAdd: (rule: Omit<IpBlockRule, "id" | "createdAt">) => void;
  trigger?: React.ReactNode;
};

export const CreateIpRuleDialog = ({
  onAdd,
  trigger,
}: CreateIpRuleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setHost("");
    setIpAddress("");
    setNote("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) return;
    onAdd({
      host: host.trim() || "*",
      ipAddress: ipAddress.trim(),
      note: note.trim(),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="xs">
            <Plus className="size-4" />
            Create new rule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create IP blocking rule</DialogTitle>
          <DialogDescription>
            Block requests from a specific IP address or CIDR range. Blocked
            requests will not reach your marketplace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip-rule-host">Host (optional)</Label>
            <Input
              id="ip-rule-host"
              placeholder="* or specific hostname"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip-rule-ip">IP address or CIDR *</Label>
            <Input
              id="ip-rule-ip"
              placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip-rule-note">Note (optional)</Label>
            <Textarea
              id="ip-rule-note"
              placeholder="Reason or reference"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost" size="xs"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="xs" disabled={!ipAddress.trim()}>
              <Save className='size-3.5' />
              Add rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
