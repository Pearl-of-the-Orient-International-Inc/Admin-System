"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Download, ExternalLink, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MemberRecord } from "./members-data";

type MemberQrCodeDialogProps = {
  member: MemberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemberQrCodeDialog({
  member,
  open,
  onOpenChange,
}: MemberQrCodeDialogProps) {
  const [generatedForUrl, setGeneratedForUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const profileUrl = useMemo(() => {
    if (!member?.uniqueId) return "";
    return `https://pearlchaplaincy.org/profile/${encodeURIComponent(member.uniqueId)}`;
  }, [member]);

  const isGenerating = open && Boolean(profileUrl) && generatedForUrl !== profileUrl;
  const visibleQrDataUrl = generatedForUrl === profileUrl ? qrDataUrl : null;

  useEffect(() => {
    let active = true;

    if (!open || !profileUrl || generatedForUrl === profileUrl) {
      return;
    }

    QRCode.toDataURL(profileUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#111",
        light: "#ffffff",
      },
    })
      .then((value) => {
        if (!active) return;
        setGeneratedForUrl(profileUrl);
        setQrDataUrl(value);
      })
      .catch(() => {
        if (!active) return;
        setGeneratedForUrl(profileUrl);
        setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [generatedForUrl, open, profileUrl]);

  const handleDownload = () => {
    if (!visibleQrDataUrl || !member) return;

    const link = document.createElement("a");
    link.href = visibleQrDataUrl;
    link.download = `${buildQrFileBaseName(member.lastName, member.firstName, member.uniqueId ?? member.id)}.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl!">
        <DialogHeader>
          <DialogTitle>Member QR Code</DialogTitle>
          <DialogDescription>
            Scan or download the QR code for {member?.fullName ?? "this member"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Public profile link
            </p>
            <p className="mt-2 break-all text-sm text-foreground">{profileUrl}</p>
          </div>

          <div className="flex justify-center rounded-xl border bg-card p-6">
            {isGenerating ? (
              <div className="text-muted-foreground flex h-80 w-80 items-center justify-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Generating QR code...
              </div>
            ) : visibleQrDataUrl ? (
              <Image
                src={visibleQrDataUrl}
                alt={`QR code for ${member?.fullName ?? "member"} profile`}
                width={400}
                height={400}
                className="h-auto w-full max-w-90 object-contain"
                unoptimized
              />
            ) : (
              <div className="text-muted-foreground flex h-80 w-80 items-center justify-center text-sm">
                QR code preview is unavailable.
              </div>
            )}
          </div>
        </div>

        <DialogFooter showCloseButton>
          {profileUrl ? (
            <Button asChild variant="outline">
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Open profile
              </a>
            </Button>
          ) : null}
          <Button onClick={handleDownload} disabled={!visibleQrDataUrl}>
            <Download className="size-4" />
            Download QR code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildQrFileBaseName(lastName: string, firstName: string, idNumber: string) {
  return [
    sanitizeFileNameSegment(lastName),
    sanitizeFileNameSegment(firstName),
    sanitizeFileNameSegment(idNumber),
  ]
    .filter(Boolean)
    .join("-");
}

function sanitizeFileNameSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
