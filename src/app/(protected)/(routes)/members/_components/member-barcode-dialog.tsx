"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import bwipjs from "bwip-js/browser";
import { Download, LoaderCircle } from "lucide-react";

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
import type { MemberCredentialDocumentType } from "@/features/members/member.types";
import { toApiError } from "@/lib/http-client";
import type { MemberRecord } from "./members-data";

type MemberBarcodeDialogProps = {
  member: MemberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const barcodeTypeOptions: Array<{
  label: string;
  value: MemberCredentialDocumentType;
}> = [
  { label: "Certificates", value: "CERTIFICATE" },
  { label: "Recognition", value: "RECOGNITION" },
];

export function MemberBarcodeDialog({
  member,
  open,
  onOpenChange,
}: MemberBarcodeDialogProps) {
  const [selectedType, setSelectedType] =
    useState<MemberCredentialDocumentType>("CERTIFICATE");
  const generateDocumentMutation =
    useGenerateMemberCredentialDocumentMutation();
  const { mutate: generateCredentialDocument } = generateDocumentMutation;
  const generatedDocument = generateDocumentMutation.data;
  const credentialDocument = generatedDocument
    ? generatedDocument.memberId === member?.memberId &&
      generatedDocument.type === selectedType
      ? generatedDocument
      : null
    : null;
  const barcodeValue = credentialDocument?.barcodeNumber ?? "";
  const barcodeDataUrl = useMemo(() => {
    if (!barcodeValue || typeof document === "undefined") return null;

    try {
      const canvas = document.createElement("canvas");
      bwipjs.toCanvas(canvas, {
        bcid: "ean13",
        text: barcodeValue,
        scale: 3,
        height: 22,
        includetext: true,
        textxalign: "center",
        textsize: 10,
        backgroundcolor: "FFFFFF",
      });

      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }, [barcodeValue]);
  const errorMessage = generateDocumentMutation.error
    ? toApiError(generateDocumentMutation.error).message
    : null;

  useEffect(() => {
    if (!open || !member?.memberId) return;

    generateCredentialDocument({
      memberId: member.memberId,
      type: selectedType,
    });
  }, [generateCredentialDocument, member?.memberId, open, selectedType]);

  const handleDownload = () => {
    if (!barcodeDataUrl || !member) return;

    const link = document.createElement("a");
    link.href = barcodeDataUrl;
    link.download = `${buildFileBaseName(member)}-${selectedType.toLowerCase()}-barcode.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl!">
        <DialogHeader>
          <DialogTitle>Member Barcode</DialogTitle>
          <DialogDescription>
            Generate document barcode for {member?.fullName ?? "this member"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <div className="rounded-lg border bg-muted/30 p-2">
              <p className="break-all text-sm truncate text-foreground">
                {barcodeValue || "Generating..."}
              </p>
            </div>

            <Select
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as MemberCredentialDocumentType)
              }
            >
              <SelectTrigger className="h-full w-full">
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                {barcodeTypeOptions.map((option) => (
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

          {credentialDocument ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="line-clamp-2 font-medium">
                {credentialDocument.title ??
                  (credentialDocument.type === "CERTIFICATE"
                    ? "Certificate"
                    : "Recognition")}
              </div>
              <div className="text-muted-foreground mt-1 line-clamp-2">
                {credentialDocument.documentNumber} -{" "}
                {member?.uniqueId ?? "No member ID"}
              </div>
            </div>
          ) : null}

          <div className="flex min-h-58 items-center justify-center rounded-xl border bg-white p-6">
            {barcodeDataUrl ? (
              <div className="flex w-full max-w-sm flex-col items-center gap-2">
                <div className="text-sm font-medium text-foreground">
                  ISBN {formatIsbnLikeBarcode(barcodeValue)}
                </div>
                <Image
                  src={barcodeDataUrl}
                  alt={`EAN-13 barcode for ${member?.fullName ?? "member"}`}
                  width={420}
                  height={180}
                  className="h-auto w-full rounded bg-white object-contain"
                  unoptimized
                />
              </div>
            ) : generateDocumentMutation.isPending ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <LoaderCircle className="size-4 animate-spin" />
                Generating barcode...
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Barcode preview is unavailable.
              </div>
            )}
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleDownload} disabled={!barcodeDataUrl}>
            <Download className="size-4" />
            Download barcode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatIsbnLikeBarcode(value: string) {
  return value.replace(
    /^(\d{3})(\d)(\d{3})(\d{5})(\d)$/,
    "$1-$2-$3-$4-$5",
  );
}

function buildFileBaseName(member: MemberRecord) {
  return [member.lastName, member.firstName, member.uniqueId ?? member.id]
    .map(sanitizeFileNameSegment)
    .filter(Boolean)
    .join("-");
}

function sanitizeFileNameSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
