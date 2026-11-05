"use client";

import { useEffect, useState } from "react";
import { Facebook, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, toApiError } from "@/lib/http-client";

type FacebookConfiguration = {
  configured: boolean;
  pageId: string | null;
  tokenLastFour: string | null;
  expiresAt: string | null;
};

function getDefaultExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 60);
  return date.toISOString().slice(0, 10);
}

export function FacebookPageSettingsDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [existing, setExisting] = useState<FacebookConfiguration | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void api
      .get<{ data: FacebookConfiguration }>(
        "/news-blogs/facebook-page-configuration",
      )
      .then(({ data }) => {
        setExisting(data.data);
        setPageId(data.data.pageId ?? "");
        setAccessToken("");
        setExpiresAt(
          data.data.expiresAt?.slice(0, 10) ?? getDefaultExpiryDate(),
        );
      })
      .catch((error) =>
        toast({
          variant: "error",
          title: "Unable to load Facebook settings",
          description: toApiError(error).message,
        }),
      )
      .finally(() => setLoading(false));
  }, [open, toast]);

  const save = async () => {
    if (!pageId.trim() || !accessToken.trim()) {
      toast({
        variant: "error",
        title: "Missing information",
        description:
          "Enter the Facebook Page ID and a current Page access token.",
      });
      return;
    }

    if (expiresAt && expiresAt < new Date().toISOString().slice(0, 10)) {
      toast({
        variant: "error",
        title: "Expiry date has passed",
        description:
          "Enter the future date when the new Facebook token expires.",
      });
      return;
    }

    setSaving(true);
    try {
      await api.put("/news-blogs/facebook-page-configuration", {
        pageId: pageId.trim(),
        accessToken: accessToken.trim(),
        expiresAt: expiresAt
          ? new Date(`${expiresAt}T00:00:00.000Z`).toISOString()
          : null,
      });
      toast({
        title: "Facebook settings saved",
        description:
          "New post syncs will use the token stored in the database.",
      });
      setAccessToken("");
      setOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Facebook settings not saved",
        description: toApiError(error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings2 className="size-4" /> Facebook settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Facebook Page access token</DialogTitle>
          <DialogDescription>
            Stored in the application database and never shown again after it is
            saved. Set its expiry date so the team can renew it before
            publishing stops.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {existing?.configured && (
              <p className="rounded-md bg-muted p-3 text-sm">
                Current token ends in <strong>{existing.tokenLastFour}</strong>
                {existing.expiresAt
                  ? ` · expires ${new Date(existing.expiresAt).toLocaleDateString()}`
                  : " · no expiry date recorded"}
              </p>
            )}
            {existing?.expiresAt &&
            new Date(existing.expiresAt) <= new Date() ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                This saved token has expired. Paste a renewed Facebook Page
                token before syncing posts.
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="facebook-page-id">Facebook Page ID</Label>
              <Input
                id="facebook-page-id"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-access-token">
                New Page access token
              </Label>
              <Input
                id="facebook-access-token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste the current long-lived Page token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-token-expires">Expiry date</Label>
              <Input
                id="facebook-token-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Long-lived Facebook tokens commonly expire after about 60 days.
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={save} disabled={loading || saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            <Facebook className="size-4" /> Save Facebook settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
