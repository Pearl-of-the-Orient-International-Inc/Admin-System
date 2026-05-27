"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, LoaderCircle, RotateCcw, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { generateCertificateBatchPdf } from "@/lib/certificate";

import type {
  CertificateNamePlacement,
  UploadedCertificateLayout,
} from "./certifications.types";

type Props = {
  layout: UploadedCertificateLayout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (layoutId: string, placement: CertificateNamePlacement) => void;
};

const SAMPLE_NAME = "Sample Participant Name";

const DEFAULT_NAME_PLACEMENT: CertificateNamePlacement = {
  centerXPercent: 50,
  centerYPercent: 49,
  maxWidthPercent: 62,
  fontSizePercent: 4.8,
  colorHex: "#034316",
  forceUppercase: true,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CertificateLayoutPlacementDialog({
  layout,
  open,
  onOpenChange,
  onSave,
}: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<CertificateNamePlacement>(
    layout?.namePlacement ?? DEFAULT_NAME_PLACEMENT,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);

  useEffect(() => {
    if (layout) {
      setDraft(layout.namePlacement);
    }
  }, [layout]);

  const stageAspectRatio = layout ? `${layout.pageWidth} / ${layout.pageHeight}` : "4 / 3";

  const updateDraft = (partial: Partial<CertificateNamePlacement>) => {
    setDraft((current) => ({ ...current, ...partial }));
  };

  const updatePositionFromPointer = (clientX: number, clientY: number) => {
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const nextX = ((clientX - rect.left) / rect.width) * 100;
    const nextY = ((clientY - rect.top) / rect.height) * 100;

    updateDraft({
      centerXPercent: clamp(nextX, 5, 95),
      centerYPercent: clamp(nextY, 5, 95),
    });
  };

  useEffect(() => {
    if (!layout || !open) {
      setPreviewUrl((current) => {
        if (current.startsWith("blob:")) {
          URL.revokeObjectURL(current);
        }
        return "";
      });
      return;
    }

    let isActive = true;
    setIsRenderingPreview(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const previewBlob = await generateCertificateBatchPdf({
          layoutUrl: layout.previewUrl,
          namePlacement: draft,
          entries: [{ recipientName: SAMPLE_NAME }],
        });

        if (!isActive) {
          return;
        }

        const nextPreviewUrl = window.URL.createObjectURL(previewBlob);
        setPreviewUrl((current) => {
          if (current.startsWith("blob:")) {
            URL.revokeObjectURL(current);
          }
          return nextPreviewUrl;
        });
      } finally {
        if (isActive) {
          setIsRenderingPreview(false);
        }
      }
    }, 120);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [draft, layout, open]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl! gap-0 overflow-y-auto p-0 sm:max-h-[92vh]">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Name Placement</DialogTitle>
          <DialogDescription>
            Save a dedicated recipient-name position for this certificate layout.
            Each uploaded template can use its own coordinates.
          </DialogDescription>
        </DialogHeader>

        {layout ? (
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="border-b p-5 lg:border-b-0 lg:border-r lg:p-6">
              <div
                ref={stageRef}
                className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border bg-white shadow-sm select-none"
                style={{ aspectRatio: stageAspectRatio }}
                onPointerDown={(event) => {
                  setIsDragging(true);
                  updatePositionFromPointer(event.clientX, event.clientY);
                }}
                onPointerMove={(event) => {
                  if (isDragging) {
                    updatePositionFromPointer(event.clientX, event.clientY);
                  }
                }}
                onPointerUp={() => setIsDragging(false)}
                onPointerLeave={() => setIsDragging(false)}
              >
                <iframe
                  title={`${layout.name} placement preview`}
                  src={`${previewUrl || layout.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="pointer-events-none absolute inset-0 h-full w-full bg-white"
                  tabIndex={-1}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/3" />

                <button
                  type="button"
                  aria-label="Move name anchor"
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#032a0d]/92 p-2 text-white shadow-lg"
                  style={{
                    left: `${draft.centerXPercent}%`,
                    top: `${draft.centerYPercent}%`,
                  }}
                >
                  <Crosshair className="size-4" />
                </button>

                {isRenderingPreview ? (
                  <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
                    <LoaderCircle className="size-4 animate-spin" />
                    Updating generated preview
                  </div>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Drag anywhere on the preview to reposition the participant&apos;s name.
              </p>
            </div>

            <div className="space-y-5 p-5 lg:p-6">
              <div className="rounded-2xl border bg-accent/15 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{layout.name}</p>
                <p className="mt-1">
                  {Math.round(layout.pageWidth)} × {Math.round(layout.pageHeight)} PDF canvas
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Horizontal Position</Label>
                    <span className="text-xs text-muted-foreground">
                      {draft.centerXPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={0.5}
                    value={[draft.centerXPercent]}
                    onValueChange={([value]) =>
                      updateDraft({ centerXPercent: clamp(value ?? 50, 0, 100) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Vertical Position</Label>
                    <span className="text-xs text-muted-foreground">
                      {draft.centerYPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={0.5}
                    value={[draft.centerYPercent]}
                    onValueChange={([value]) =>
                      updateDraft({ centerYPercent: clamp(value ?? 49, 0, 100) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Text Width</Label>
                    <span className="text-xs text-muted-foreground">
                      {draft.maxWidthPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={20}
                    max={95}
                    step={0.5}
                    value={[draft.maxWidthPercent]}
                    onValueChange={([value]) =>
                      updateDraft({ maxWidthPercent: clamp(value ?? 62, 20, 95) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Font Size</Label>
                    <span className="text-xs text-muted-foreground">
                      {draft.fontSizePercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={1.5}
                    max={12}
                    step={0.1}
                    value={[draft.fontSizePercent]}
                    onValueChange={([value]) =>
                      updateDraft({ fontSizePercent: clamp(value ?? 4.8, 1.5, 12) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name-uppercase">Uppercase name</Label>
                    <p className="text-xs text-muted-foreground">
                      Match layouts that expect all-caps recipients.
                    </p>
                  </div>
                  <Switch
                    id="name-uppercase"
                    checked={draft.forceUppercase}
                    onCheckedChange={(checked) => updateDraft({ forceUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name-color">Name Color</Label>
                    <p className="text-xs text-muted-foreground">
                      Choose the text color that fits this certificate design.
                    </p>
                  </div>
                  <label
                    htmlFor="name-color"
                    className="flex items-center gap-3 rounded-full border px-3 py-2"
                  >
                    <input
                      id="name-color"
                      type="color"
                      className="size-8 cursor-pointer rounded-full border-0 bg-transparent p-0"
                      value={draft.colorHex}
                      onChange={(event) => updateDraft({ colorHex: event.target.value })}
                    />
                    <Type className="size-4 text-muted-foreground" />
                  </label>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(DEFAULT_NAME_PLACEMENT)}
                className="w-full justify-center"
              >
                <RotateCcw className="size-4" />
                Reset to default placement
              </Button>
            </div>
          </div>
        ) : null}

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!layout) return;
              onSave(layout.id, draft);
              onOpenChange(false);
            }}
          >
            Save placement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
