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
import { Plus, Copy, Save, Check } from "lucide-react";

export type ApiToken = {
  id: string;
  label: string;
  createdAt: string;
  /** Only set immediately after creation; not stored. */
  secretPreview?: string;
};

type CreateTokenDialogProps = {
  onCreate: (token: ApiToken) => void;
  trigger?: React.ReactNode;
};

export const CreateTokenDialog = ({
  onCreate,
  trigger,
}: CreateTokenDialogProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [createdToken, setCreatedToken] = useState<ApiToken | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const reset = () => {
    setLabel("");
    setCreatedToken(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim() || "Personal access token";
    const id = crypto.randomUUID();
    const secret = `mkt_${id.slice(0, 8)}_${Math.random().toString(36).slice(2, 18)}`;
    const token: ApiToken = {
      id,
      label: trimmed,
      createdAt: new Date().toISOString().slice(0, 10),
      secretPreview: secret,
    };
    setCreatedToken(token);
  };

  const handleCopySecret = () => {
    if (createdToken?.secretPreview) {
      navigator.clipboard.writeText(createdToken.secretPreview).catch(() => {});
    }

    handleDone();
    setIsCopied(true);
  };

  const handleDone = () => {
    if (createdToken) {
      const { secretPreview, ...rest } = createdToken;
      onCreate({ ...rest });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="xs">
            <Plus className="size-3.5" />
            Create new token
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {createdToken ? "Token created" : "Create new token"}
          </DialogTitle>
          <DialogDescription>
            {createdToken
              ? "Copy this token now. You won't be able to see it again."
              : "Personal access tokens authenticate with the platform API for scripts and integrations."}
          </DialogDescription>
        </DialogHeader>

        {createdToken ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs break-all">
              {createdToken.secretPreview}
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleCopySecret}
            >
              {isCopied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {isCopied ? "Copied" : "Copy token"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-label">Label</Label>
              <Input
                id="token-label"
                placeholder="e.g. CI/CD or Mobile app"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="xs">
                <Save className="size-3.5" />
                Create token
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
