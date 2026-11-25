"use client";

import { useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js/browser";
import QRCode from "qrcode";
import {
  Barcode,
  Crosshair,
  LoaderCircle,
  QrCode,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Upload,
  X,
  Type,
} from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateCertificateBatchPdf } from "@/lib/certificate";

import type {
  CertificateCodePlacement,
  CertificateCustomFont,
  CertificateNamePlacement,
  UploadedCertificateLayout,
} from "./certifications.types";

type Props = {
  layout: UploadedCertificateLayout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    layoutId: string,
    placement: {
      namePlacement: CertificateNamePlacement;
      codePlacement: CertificateCodePlacement;
    },
  ) => void;
  customFonts: CertificateCustomFont[];
  onUploadFonts: (files: File[]) => Promise<void>;
  onRemoveFont: (fontId: string) => Promise<void>;
};

const SAMPLE_NAME = "Sample Participant Name";
const SAMPLE_QR_VALUE = "https://pearlchaplaincy.org/credentials/verify/sample";
const SAMPLE_BARCODE_VALUE = "9784260000017";

const DEFAULT_NAME_PLACEMENT: CertificateNamePlacement = {
  centerXPercent: 50,
  centerYPercent: 49,
  maxWidthPercent: 62,
  fontSizePercent: 4.8,
  colorHex: "#034316",
  forceUppercase: true,
  fontFamily: "times",
  fontWeight: "bold",
  fontStyle: "normal",
  textAlign: "center",
  underline: false,
};

const DEFAULT_CODE_PLACEMENT: CertificateCodePlacement = {
  qr: {
    enabled: true,
    centerXPercent: 86,
    centerYPercent: 88,
    sizePercent: 11,
  },
  barcode: {
    enabled: true,
    centerXPercent: 24,
    centerYPercent: 90,
    widthPercent: 24,
    heightPercent: 7,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CertificateLayoutPlacementDialog({
  layout,
  open,
  onOpenChange,
  onSave,
  customFonts,
  onUploadFonts,
  onRemoveFont,
}: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [activeTarget, setActiveTarget] = useState<"name" | "qr" | "barcode">("name");
  const [draftName, setDraftName] = useState<CertificateNamePlacement>(
    layout?.namePlacement ?? DEFAULT_NAME_PLACEMENT,
  );
  const [draftCodes, setDraftCodes] = useState<CertificateCodePlacement>(
    layout?.codePlacement ?? DEFAULT_CODE_PLACEMENT,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [sampleQrCodeDataUrl, setSampleQrCodeDataUrl] = useState<string | null>(null);
  const [sampleBarcodeDataUrl, setSampleBarcodeDataUrl] = useState<string | null>(null);
  const fontInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingFonts, setIsUploadingFonts] = useState(false);

  useEffect(() => {
    if (layout) {
      setDraftName({ ...DEFAULT_NAME_PLACEMENT, ...layout.namePlacement });
      setDraftCodes(layout.codePlacement);
    }
  }, [layout]);

  const stageAspectRatio = layout ? `${layout.pageWidth} / ${layout.pageHeight}` : "4 / 3";

  const updateDraftName = (partial: Partial<CertificateNamePlacement>) => {
    setDraftName((current) => ({ ...current, ...partial }));
  };

  const updateDraftCodes = (partial: {
    qr?: Partial<CertificateCodePlacement["qr"]>;
    barcode?: Partial<CertificateCodePlacement["barcode"]>;
  }) => {
    setDraftCodes((current) => ({
      qr: { ...current.qr, ...partial.qr },
      barcode: { ...current.barcode, ...partial.barcode },
    }));
  };

  const updatePositionFromPointer = (clientX: number, clientY: number) => {
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const nextX = ((clientX - rect.left) / rect.width) * 100;
    const nextY = ((clientY - rect.top) / rect.height) * 100;

    if (activeTarget === "name") {
      updateDraftName({
        centerXPercent: clamp(nextX, 5, 95),
        centerYPercent: clamp(nextY, 5, 95),
      });
      return;
    }

    updateDraftCodes({
      [activeTarget]: {
        centerXPercent: clamp(nextX, 2, 98),
        centerYPercent: clamp(nextY, 2, 98),
      },
    });
  };

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(SAMPLE_QR_VALUE, {
      width: 400,
      margin: 2,
      color: { dark: "#111111", light: "#ffffff" },
    }).then((value) => {
      if (active) setSampleQrCodeDataUrl(value);
    });

    try {
      const canvas = document.createElement("canvas");
      bwipjs.toCanvas(canvas, {
        bcid: "ean13",
        text: SAMPLE_BARCODE_VALUE,
        scale: 3,
        height: 22,
        includetext: true,
        textxalign: "center",
        textsize: 10,
        backgroundcolor: "FFFFFF",
      });
      setSampleBarcodeDataUrl(canvas.toDataURL("image/png"));
    } catch {
      setSampleBarcodeDataUrl(null);
    }

    return () => {
      active = false;
    };
  }, []);

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
          namePlacement: draftName,
          codePlacement: draftCodes,
          entries: [
            {
              recipientName: SAMPLE_NAME,
              qrCodeDataUrl: sampleQrCodeDataUrl,
              barcodeDataUrl: sampleBarcodeDataUrl,
            },
          ],
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
  }, [draftCodes, draftName, layout, open, sampleBarcodeDataUrl, sampleQrCodeDataUrl]);

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
          <DialogTitle>Certificate Element Placement</DialogTitle>
          <DialogDescription>
            Save dedicated name, QR code, and barcode positions for this uploaded
            certificate layout.
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
                  aria-label={`Move ${activeTarget} anchor`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#032a0d]/92 p-2 text-white shadow-lg"
                  style={{
                    left: `${
                      activeTarget === "name"
                        ? draftName.centerXPercent
                        : draftCodes[activeTarget].centerXPercent
                    }%`,
                    top: `${
                      activeTarget === "name"
                        ? draftName.centerYPercent
                        : draftCodes[activeTarget].centerYPercent
                    }%`,
                  }}
                >
                  {activeTarget === "name" ? (
                    <Crosshair className="size-4" />
                  ) : activeTarget === "qr" ? (
                    <QrCode className="size-4" />
                  ) : (
                    <Barcode className="size-4" />
                  )}
                </button>

                {isRenderingPreview ? (
                  <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
                    <LoaderCircle className="size-4 animate-spin" />
                    Updating generated preview
                  </div>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Choose an element, then drag anywhere on the preview to reposition it.
              </p>
            </div>

            <div className="space-y-5 p-5 lg:p-6">
              <div className="rounded-2xl border bg-accent/15 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{layout.name}</p>
                <p className="mt-1">
                  {Math.round(layout.pageWidth)} × {Math.round(layout.pageHeight)} PDF canvas
                </p>
              </div>

              <Tabs
                value={activeTarget}
                onValueChange={(value) =>
                  setActiveTarget(value as "name" | "qr" | "barcode")
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="name">
                    <Type className="size-4" />
                    Name
                  </TabsTrigger>
                  <TabsTrigger value="qr">
                    <QrCode className="size-4" />
                    QR
                  </TabsTrigger>
                  <TabsTrigger value="barcode">
                    <Barcode className="size-4" />
                    Barcode
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTarget === "name" ? (
                <>
                  <div className="space-y-3 rounded-2xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Label>Font</Label>
                      <input
                        ref={fontInputRef}
                        type="file"
                        accept=".ttf,.otf,font/ttf,font/otf"
                        multiple
                        className="hidden"
                        onChange={async (event) => {
                          const files = Array.from(event.target.files ?? []);
                          if (!files.length) return;
                          setIsUploadingFonts(true);
                          try { await onUploadFonts(files); } finally { setIsUploadingFonts(false); event.target.value = ""; }
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => fontInputRef.current?.click()} disabled={isUploadingFonts}>
                        <Upload className="size-4" />{isUploadingFonts ? "Uploading" : "Upload font"}
                      </Button>
                    </div>
                    <Select value={draftName.fontFamily} onValueChange={(fontFamily) => updateDraftName({ fontFamily })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose a font" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="times">Times New Roman</SelectItem>
                        <SelectItem value="helvetica">Helvetica</SelectItem>
                        <SelectItem value="courier">Courier New</SelectItem>
                        {customFonts.length ? customFonts.map((font) => <SelectItem key={font.id} value={font.id}>{font.family} · {font.format.toUpperCase()}</SelectItem>) : null}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={String(Math.round(draftName.fontSizePercent * 10))} onValueChange={(value) => updateDraftName({ fontSizePercent: Number(value) / 10 })}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>{[18, 24, 30, 36, 42, 48, 60, 72, 84, 96].map((size) => <SelectItem key={size} value={String(size)}>{size / 10}%</SelectItem>)}</SelectContent>
                      </Select>
                      <Button type="button" size="icon-sm" variant={draftName.fontWeight === "bold" ? "secondary" : "outline"} onClick={() => updateDraftName({ fontWeight: draftName.fontWeight === "bold" ? "normal" : "bold" })} aria-label="Bold"><Bold className="size-4" /></Button>
                      <Button type="button" size="icon-sm" variant={draftName.fontStyle === "italic" ? "secondary" : "outline"} onClick={() => updateDraftName({ fontStyle: draftName.fontStyle === "italic" ? "normal" : "italic" })} aria-label="Italic"><Italic className="size-4" /></Button>
                      <Button type="button" size="icon-sm" variant={draftName.underline ? "secondary" : "outline"} onClick={() => updateDraftName({ underline: !draftName.underline })} aria-label="Underline"><Underline className="size-4" /></Button>
                      <span className="mx-1 h-6 border-l" />
                      {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([align, Icon]) => <Button key={align} type="button" size="icon-sm" variant={draftName.textAlign === align ? "secondary" : "outline"} onClick={() => updateDraftName({ textAlign: align })} aria-label={`Align ${align}`}><Icon className="size-4" /></Button>)}
                    </div>
                    {customFonts.length ? <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">{customFonts.map((font) => <span key={font.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-1">{font.family}<button type="button" onClick={() => void onRemoveFont(font.id)} aria-label={`Remove ${font.family}`}><X className="size-3" /></button></span>)}</div> : <p className="text-xs text-muted-foreground">Custom .ttf and .otf fonts are saved in this browser’s certificate font library.</p>}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Horizontal Position</Label>
                    <span className="text-xs text-muted-foreground">
                      {draftName.centerXPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={0.5}
                    value={[draftName.centerXPercent]}
                    onValueChange={([value]) =>
                      updateDraftName({ centerXPercent: clamp(value ?? 50, 0, 100) })
                    }
                  />
                    </div>

                    <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Vertical Position</Label>
                    <span className="text-xs text-muted-foreground">
                      {draftName.centerYPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={0.5}
                    value={[draftName.centerYPercent]}
                    onValueChange={([value]) =>
                      updateDraftName({ centerYPercent: clamp(value ?? 49, 0, 100) })
                    }
                  />
                    </div>

                    <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Text Width</Label>
                    <span className="text-xs text-muted-foreground">
                      {draftName.maxWidthPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={20}
                    max={95}
                    step={0.5}
                    value={[draftName.maxWidthPercent]}
                    onValueChange={([value]) =>
                      updateDraftName({ maxWidthPercent: clamp(value ?? 62, 20, 95) })
                    }
                  />
                    </div>

                    <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Font Size</Label>
                    <span className="text-xs text-muted-foreground">
                      {draftName.fontSizePercent.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    min={1.5}
                    max={12}
                    step={0.1}
                    value={[draftName.fontSizePercent]}
                    onValueChange={([value]) =>
                      updateDraftName({ fontSizePercent: clamp(value ?? 4.8, 1.5, 12) })
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
                        checked={draftName.forceUppercase}
                        onCheckedChange={(checked) =>
                          updateDraftName({ forceUppercase: checked })
                        }
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
                          value={draftName.colorHex}
                          onChange={(event) =>
                            updateDraftName({ colorHex: event.target.value })
                          }
                        />
                        <Type className="size-4 text-muted-foreground" />
                      </label>
                    </div>
                  </div>
                </>
              ) : activeTarget === "qr" ? (
                <CodePlacementControls
                  enabled={draftCodes.qr.enabled}
                  centerXPercent={draftCodes.qr.centerXPercent}
                  centerYPercent={draftCodes.qr.centerYPercent}
                  sizeLabel="QR Size"
                  sizePercent={draftCodes.qr.sizePercent}
                  sizeMin={3}
                  sizeMax={35}
                  onEnabledChange={(enabled) => updateDraftCodes({ qr: { enabled } })}
                  onPositionChange={(position) => updateDraftCodes({ qr: position })}
                  onSizeChange={(sizePercent) =>
                    updateDraftCodes({ qr: { sizePercent } })
                  }
                />
              ) : (
                <BarcodePlacementControls
                  placement={draftCodes.barcode}
                  onChange={(barcode) => updateDraftCodes({ barcode })}
                />
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTarget === "name") {
                    setDraftName(DEFAULT_NAME_PLACEMENT);
                  } else if (activeTarget === "qr") {
                    updateDraftCodes({ qr: DEFAULT_CODE_PLACEMENT.qr });
                  } else {
                    updateDraftCodes({ barcode: DEFAULT_CODE_PLACEMENT.barcode });
                  }
                }}
                className="w-full justify-center"
              >
                <RotateCcw className="size-4" />
                Reset current placement
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
              onSave(layout.id, {
                namePlacement: draftName,
                codePlacement: draftCodes,
              });
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

function CodePlacementControls({
  enabled,
  centerXPercent,
  centerYPercent,
  sizeLabel,
  sizePercent,
  sizeMin,
  sizeMax,
  onEnabledChange,
  onPositionChange,
  onSizeChange,
}: {
  enabled: boolean;
  centerXPercent: number;
  centerYPercent: number;
  sizeLabel: string;
  sizePercent: number;
  sizeMin: number;
  sizeMax: number;
  onEnabledChange: (enabled: boolean) => void;
  onPositionChange: (position: {
    centerXPercent?: number;
    centerYPercent?: number;
  }) => void;
  onSizeChange: (sizePercent: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <Label>Show on certificate</Label>
          <p className="text-xs text-muted-foreground">
            Print this generated element on each certificate page.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      <PercentSlider
        label="Horizontal Position"
        value={centerXPercent}
        min={0}
        max={100}
        step={0.5}
        onChange={(value) => onPositionChange({ centerXPercent: value })}
      />
      <PercentSlider
        label="Vertical Position"
        value={centerYPercent}
        min={0}
        max={100}
        step={0.5}
        onChange={(value) => onPositionChange({ centerYPercent: value })}
      />
      <PercentSlider
        label={sizeLabel}
        value={sizePercent}
        min={sizeMin}
        max={sizeMax}
        step={0.5}
        onChange={onSizeChange}
      />
    </div>
  );
}

function BarcodePlacementControls({
  placement,
  onChange,
}: {
  placement: CertificateCodePlacement["barcode"];
  onChange: (placement: Partial<CertificateCodePlacement["barcode"]>) => void;
}) {
  return (
    <div className="space-y-4">
      <CodePlacementControls
        enabled={placement.enabled}
        centerXPercent={placement.centerXPercent}
        centerYPercent={placement.centerYPercent}
        sizeLabel="Barcode Width"
        sizePercent={placement.widthPercent}
        sizeMin={5}
        sizeMax={80}
        onEnabledChange={(enabled) => onChange({ enabled })}
        onPositionChange={onChange}
        onSizeChange={(widthPercent) => onChange({ widthPercent })}
      />
      <PercentSlider
        label="Barcode Height"
        value={placement.heightPercent}
        min={2}
        max={30}
        step={0.5}
        onChange={(heightPercent) => onChange({ heightPercent })}
      />
    </div>
  );
}

function PercentSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{value.toFixed(1)}%</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([nextValue]) => onChange(clamp(nextValue ?? value, min, max))}
      />
    </div>
  );
}
