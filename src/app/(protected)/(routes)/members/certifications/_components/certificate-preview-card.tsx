"use client";

import type { CertificatePreviewItem } from "./certifications.types";

type Props = {
  preview: CertificatePreviewItem;
};

export function CertificatePreviewCard({ preview }: Props) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
      <div
        className="overflow-hidden bg-black/5"
        style={{ aspectRatio: `${preview.pageWidth} / ${preview.pageHeight}` }}
      >
        <iframe
          title={`${preview.participantName} certificate preview`}
          src={`${preview.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="pointer-events-none h-full w-full bg-white"
          tabIndex={-1}
        />
      </div>

      <div className="space-y-2 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Recipient</span>
          <span className="text-right font-medium">{preview.participantName}</span>
        </div>
      </div>
    </div>
  );
}
