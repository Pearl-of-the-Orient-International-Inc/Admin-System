"use client";

import { Barcode, FileText, ImagePlus, Move, QrCode, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { UploadedCertificateLayout } from "./certifications.types";

type Props = {
  uploadedLayouts: UploadedCertificateLayout[];
  selectedLayoutId: string;
  onSelectLayout: (layoutId: string) => void;
  onRemoveLayout: (layoutId: string) => void;
  onEditPlacement: (layoutId: string) => void;
};

export function CertificateLayoutLibrary({
  uploadedLayouts,
  selectedLayoutId,
  onSelectLayout,
  onRemoveLayout,
  onEditPlacement,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Certificate Layouts</CardTitle>
        <CardDescription>
          Browse the uploaded PDF templates that can be used during certificate generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedLayouts.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {uploadedLayouts.map((layout) => (
              <div
                key={layout.id}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  selectedLayoutId === layout.id
                    ? "border-[#032a0d] shadow-md"
                    : "border-border hover:border-[#032a0d]/30"
                }`}
              >
                <div
                  className="relative overflow-hidden bg-accent/20"
                  style={{ aspectRatio: `${layout.pageWidth} / ${layout.pageHeight}` }}
                >
                  <iframe
                    title={layout.name}
                    src={`${layout.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="pointer-events-none h-full w-full bg-white"
                    tabIndex={-1}
                  />

                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditPlacement(layout.id)}
                      className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
                    >
                      Position elements
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLayout(layout.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                        selectedLayoutId === layout.id
                          ? "bg-[#032a0d] text-white"
                          : "bg-white/95 text-slate-700"
                      }`}
                    >
                      {selectedLayoutId === layout.id ? "Selected" : "Use"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveLayout(layout.id)}
                      className="rounded-full bg-white/95 p-2 text-slate-600 shadow-sm hover:text-red-600"
                      aria-label={`Remove ${layout.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">{layout.name}</p>
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Move className="size-3.5" />
                    <span>
                      Name at {layout.namePlacement.centerXPercent.toFixed(0)}% /{" "}
                      {layout.namePlacement.centerYPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <QrCode className="size-3.5" />
                      QR {layout.codePlacement.qr.centerXPercent.toFixed(0)}% /{" "}
                      {layout.codePlacement.qr.centerYPercent.toFixed(0)}%
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Barcode className="size-3.5" />
                      Barcode {layout.codePlacement.barcode.centerXPercent.toFixed(0)}% /{" "}
                      {layout.codePlacement.barcode.centerYPercent.toFixed(0)}%
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{layout.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-accent/20 px-6 py-16 text-center">
            <ImagePlus className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">
              No certificate layouts uploaded yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your exported PDF template first, then open the generation sheet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
