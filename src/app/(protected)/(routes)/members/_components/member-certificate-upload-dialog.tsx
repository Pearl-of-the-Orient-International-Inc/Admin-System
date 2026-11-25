"use client";

import { useEffect, useId, useState } from "react";
import { FileUp, LoaderCircle, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as memberApi from "@/features/members/member.api";
import { uploadGeneratedMemberCertificate } from "@/features/members/member-certificate-upload.api";
import { useToast } from "@/hooks/use-toast";
import type { MemberRecord } from "./members-data";

type MemberCertificateUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
};

const ISSUER =
  "Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MemberCertificateUploadDialog({
  open,
  onOpenChange,
  member,
}: MemberCertificateUploadDialogProps) {
  const { toast } = useToast();
  const fileInputId = useId();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"CERTIFICATE" | "RECOGNITION">(
    "CERTIFICATE",
  );
  const [issuer, setIssuer] = useState(ISSUER);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState(today());
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setType("CERTIFICATE");
    setIssuer(ISSUER);
    setReferenceNumber("");
    setIssuedAt(today());
    setExpiresAt("");
    setFile(null);
  };

  useEffect(() => {
    if (open) resetForm();
  }, [open, member?.memberId]);

  const close = () => {
    if (!isUploading) onOpenChange(false);
  };

  const handleFileChange = (nextFile: File | undefined) => {
    if (!nextFile) return;

    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({
        variant: "error",
        title: "PDF required",
        description: "Only completed certificate PDF files can be uploaded.",
      });
      return;
    }

    if (nextFile.size > 16 * 1024 * 1024) {
      toast({
        variant: "error",
        title: "File is too large",
        description: "Certificate PDFs must be 16 MB or smaller.",
      });
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!member || !file) {
      toast({
        variant: "error",
        title: "Certificate PDF required",
        description: "Choose the completed certificate PDF before uploading.",
      });
      return;
    }

    if (!title.trim() || !issuer.trim() || !referenceNumber.trim() || !issuedAt) {
      toast({
        variant: "error",
        title: "Complete the certificate details",
        description: "Title, issuer, reference number, and issue date are required.",
      });
      return;
    }

    if (expiresAt && expiresAt < issuedAt) {
      toast({
        variant: "error",
        title: "Invalid expiration date",
        description: "The expiration date cannot be before the issue date.",
      });
      return;
    }

    try {
      setIsUploading(true);
      const uploaded = await uploadGeneratedMemberCertificate(file);
      const certificateUrl = uploaded?.ufsUrl ?? uploaded?.url;

      if (!certificateUrl) {
        throw new Error("The certificate file could not be uploaded.");
      }

      await memberApi.createMemberCertificateByAdmin({
        memberId: member.memberId,
        type,
        title: title.trim(),
        issuer: issuer.trim(),
        referenceNumber: referenceNumber.trim(),
        certificateUrl,
        issuedAt: `${issuedAt}T00:00:00.000Z`,
        expiresAt: expiresAt
          ? `${expiresAt}T00:00:00.000Z`
          : null,
      });

      toast({
        variant: "success",
        title: "Certificate added to member record",
        description: `${title.trim()} is now available in ${member.fullName}'s digital certificate record.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Certificate upload failed",
        description:
          error instanceof Error
            ? error.message
            : "The certificate could not be added right now.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload member certificate</DialogTitle>
          <DialogDescription>
            Attach a completed, externally-created certificate PDF to{" "}
            <span className="font-medium text-foreground">{member?.fullName ?? "this member"}</span>.
            It will appear with system-generated certificates in the member&apos;s digital records.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="certificate-title">Certificate title</Label>
              <Input
                id="certificate-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Certificate of Completion"
                maxLength={150}
                disabled={isUploading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as "CERTIFICATE" | "RECOGNITION")
                }
                disabled={isUploading}
              >
                <SelectTrigger aria-label="Certificate category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                  <SelectItem value="RECOGNITION">Recognition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificate-reference">Reference number</Label>
              <Input
                id="certificate-reference"
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
                placeholder="e.g. CERT-2026-001"
                maxLength={100}
                disabled={isUploading}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="certificate-issuer">Issuer</Label>
              <Input
                id="certificate-issuer"
                value={issuer}
                onChange={(event) => setIssuer(event.target.value)}
                maxLength={150}
                disabled={isUploading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificate-issued-at">Date issued</Label>
              <Input
                id="certificate-issued-at"
                type="date"
                value={issuedAt}
                onChange={(event) => setIssuedAt(event.target.value)}
                disabled={isUploading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificate-expires-at">Expiration date (optional)</Label>
              <Input
                id="certificate-expires-at"
                type="date"
                value={expiresAt}
                min={issuedAt || undefined}
                onChange={(event) => setExpiresAt(event.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={fileInputId}>Completed certificate PDF</Label>
            <label
              htmlFor={fileInputId}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-5 py-7 text-center transition-colors hover:bg-muted/60"
            >
              <FileUp className="size-6 text-primary" />
              <span className="font-medium">{file?.name ?? "Choose certificate PDF"}</span>
              <span className="text-muted-foreground text-sm">PDF only, up to 16 MB</span>
            </label>
            <Input
              id={fileInputId}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={isUploading}
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !member}>
              {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {isUploading ? "Uploading..." : "Upload certificate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
