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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateMemberCredentialDocumentMutation } from "@/features/members/member.hooks";
import type {
  MemberCredentialDocumentType,
} from "@/features/members/member.types";
import { toApiError } from "@/lib/http-client";
import type { MemberRecord } from "./members-data";

type MemberQrCodeDialogProps = {
  member: MemberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
type MemberQrMode = "PHYSICAL_ID" | MemberCredentialDocumentType;

const qrModeOptions: Array<{ label: string; value: MemberQrMode }> = [
  { label: "Physical ID", value: "PHYSICAL_ID" },
  { label: "Certificates", value: "CERTIFICATE" },
  { label: "Recognition", value: "RECOGNITION" },
];

export function MemberQrCodeDialog({
  member,
  open,
  onOpenChange,
}: MemberQrCodeDialogProps) {
  const [generatedForUrl, setGeneratedForUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<MemberQrMode>("PHYSICAL_ID");
  const generateDocumentMutation =
    useGenerateMemberCredentialDocumentMutation();
  const { mutate: generateCredentialDocument } = generateDocumentMutation;
  const generatedDocument = generateDocumentMutation.data;
  const credentialDocument = generatedDocument
    ? selectedMode !== "PHYSICAL_ID" &&
      generatedDocument.memberId === member?.memberId &&
      generatedDocument.type === selectedMode
      ? generatedDocument
      : null
    : null;

  const profileUrl = useMemo(() => {
    if (!member?.uniqueId) return "";
    return `https://pearlchaplaincy.org/profile/${encodeURIComponent(member.uniqueId)}`;
  }, [member]);

  const websiteUrl =
    process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "") ??
    "https://pearlchaplaincy.org";
  const verificationUrl = useMemo(() => {
    if (!credentialDocument?.verificationToken) return "";
    return `${websiteUrl}/credentials/verify/${encodeURIComponent(
      credentialDocument.verificationToken,
    )}`;
  }, [credentialDocument?.verificationToken, websiteUrl]);
  const qrValue = selectedMode === "PHYSICAL_ID" ? profileUrl : verificationUrl;
  const selectedModeLabel =
    qrModeOptions.find((option) => option.value === selectedMode)?.label ??
    "QR code";
  const errorMessage = generateDocumentMutation.error
    ? toApiError(generateDocumentMutation.error).message
    : null;
  const isGenerating =
    open &&
    (generateDocumentMutation.isPending ||
      (Boolean(qrValue) && generatedForUrl !== qrValue));
  const visibleQrDataUrl = generatedForUrl === qrValue ? qrDataUrl : null;

  useEffect(() => {
    if (!open || !member?.memberId || selectedMode === "PHYSICAL_ID") {
      return;
    }

    generateCredentialDocument({
      memberId: member.memberId,
      type: selectedMode,
    });
  }, [generateCredentialDocument, member?.memberId, open, selectedMode]);

  useEffect(() => {
    let active = true;

    if (!open || !qrValue || generatedForUrl === qrValue) {
      return;
    }

    QRCode.toDataURL(qrValue, {
      width: 400,
      margin: 2,
      color: {
        dark: "#111",
        light: "#ffffff",
      },
    })
      .then((value) => {
        if (!active) return;
        setGeneratedForUrl(qrValue);
        setQrDataUrl(value);
      })
      .catch(() => {
        if (!active) return;
        setGeneratedForUrl(qrValue);
        setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [generatedForUrl, open, qrValue]);

  const handleDownload = () => {
    if (!visibleQrDataUrl || !member) return;

    const link = document.createElement("a");
    link.href = visibleQrDataUrl;
    link.download = `${buildQrFileBaseName(
      member.lastName,
      member.firstName,
      member.uniqueId ?? member.id,
    )}-${selectedMode.toLowerCase()}-qr.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl!">
        <DialogHeader>
          <DialogTitle>Member QR Code</DialogTitle>
          <DialogDescription>
            Scan or download QR code for {member?.fullName ?? "this member"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="min-w-0 rounded-lg border bg-muted/30 p-2">
              <p className="break-all truncate text-sm text-foreground">
                {qrValue || "Generating..."}
              </p>
            </div>
            <Select
              value={selectedMode}
              onValueChange={(value) => setSelectedMode(value as MemberQrMode)}
            >
              <SelectTrigger className="w-full h-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qrModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-center rounded-xl border bg-card p-6">
            {isGenerating ? (
              <div className="text-muted-foreground flex h-80 w-80 items-center justify-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Generating QR code...
              </div>
            ) : visibleQrDataUrl ? (
              <Image
                src={visibleQrDataUrl}
                alt={`${selectedModeLabel} QR code for ${member?.fullName ?? "member"}`}
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
          {qrValue ? (
            <Button asChild variant="outline">
              <a href={qrValue} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {selectedMode === "PHYSICAL_ID"
                  ? "Open profile"
                  : "Open verification"}
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

function buildQrFileBaseName(
  lastName: string,
  firstName: string,
  idNumber: string,
) {
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
