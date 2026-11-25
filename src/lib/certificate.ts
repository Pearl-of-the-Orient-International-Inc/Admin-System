import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, type PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { CertificateCustomFont, CertificateTextAlign } from "@/app/(protected)/(routes)/members/certifications/_components/certifications.types";

type CertificateNamePlacement = {
  centerXPercent: number;
  centerYPercent: number;
  maxWidthPercent: number;
  fontSizePercent: number;
  colorHex: string;
  forceUppercase: boolean;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: CertificateTextAlign;
  underline: boolean;
};

type CertificateCodePlacement = {
  qr: {
    enabled: boolean;
    centerXPercent: number;
    centerYPercent: number;
    sizePercent: number;
  };
  barcode: {
    enabled: boolean;
    centerXPercent: number;
    centerYPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
};

type CertificateBatchEntry = {
  recipientName: string;
  qrCodeDataUrl?: string | null;
  barcodeDataUrl?: string | null;
};

type GenerateCertificateBatchPdfInput = {
  layoutUrl: string;
  entries: CertificateBatchEntry[];
  namePlacement?: CertificateNamePlacement;
  codePlacement?: CertificateCodePlacement;
  customFonts?: CertificateCustomFont[];
};

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

async function fetchAsBytes(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load the uploaded certificate layout.");
  }

  return new Uint8Array(await response.arrayBuffer());
}

function fitTextSize(text: string, maxSize: number, minSize: number) {
  const length = text.trim().length;

  if (length <= 24) return maxSize;
  if (length <= 36) return Math.max(maxSize - 4, minSize);
  if (length <= 52) return Math.max(maxSize - 8, minSize);

  return minSize;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace(/^#/, "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return rgb(0.012, 0.165, 0.051);
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  return rgb(red, green, blue);
}

async function dataUrlToBytes(dataUrl: string) {
  const response = await fetch(dataUrl);
  return new Uint8Array(await response.arrayBuffer());
}

function fitTextSizeToWidth(params: {
  text: string;
  font: PDFFont;
  maxSize: number;
  minSize: number;
  maxWidth: number;
}) {
  const { text, font, maxSize, minSize, maxWidth } = params;
  let nextSize = fitTextSize(text, maxSize, minSize);

  while (nextSize > minSize && font.widthOfTextAtSize(text, nextSize) > maxWidth) {
    nextSize -= 1;
  }

  return nextSize;
}

function drawText(params: {
  pageCenterX: number;
  page: PDFPage;
  text: string;
  y: number;
  size: number;
  font: PDFFont;
  color: ReturnType<typeof rgb>;
  align: CertificateTextAlign;
  maxWidth: number;
  underline: boolean;
}) {
  const { pageCenterX, page, text, y, size, font, color, align, maxWidth, underline } = params;
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = align === "left" ? pageCenterX - maxWidth / 2 : align === "right" ? pageCenterX + maxWidth / 2 - textWidth : pageCenterX - textWidth / 2;

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });

  if (underline) {
    page.drawLine({ start: { x, y: y - size * 0.12 }, end: { x: x + textWidth, y: y - size * 0.12 }, thickness: Math.max(0.7, size * 0.05), color });
  }
}

async function resolveCertificateFont(doc: PDFDocument, placement: CertificateNamePlacement, customFonts: CertificateCustomFont[]) {
  const customFont = customFonts.find((font) => font.id === placement.fontFamily);
  if (customFont) {
    doc.registerFontkit(fontkit);
    return doc.embedFont(customFont.bytes);
  }

  const isBold = placement.fontWeight === "bold";
  const isItalic = placement.fontStyle === "italic";
  const families = placement.fontFamily === "helvetica"
    ? [StandardFonts.Helvetica, StandardFonts.HelveticaBold, StandardFonts.HelveticaOblique, StandardFonts.HelveticaBoldOblique]
    : placement.fontFamily === "courier"
      ? [StandardFonts.Courier, StandardFonts.CourierBold, StandardFonts.CourierOblique, StandardFonts.CourierBoldOblique]
      : [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.TimesRomanBoldItalic];
  return doc.embedFont(families[isBold ? (isItalic ? 3 : 1) : (isItalic ? 2 : 0)]);
}

export async function generateCertificateBatchPdf({
  layoutUrl,
  entries,
  namePlacement = DEFAULT_NAME_PLACEMENT,
  codePlacement = DEFAULT_CODE_PLACEMENT,
  customFonts = [],
}: GenerateCertificateBatchPdfInput): Promise<Blob> {
  const templateBytes = await fetchAsBytes(layoutUrl);
  const batchDoc = await PDFDocument.create();
  const accent = hexToRgb(namePlacement.colorHex);

  for (const entry of entries) {
    const templateDoc = await PDFDocument.load(templateBytes.slice());
    const certificateFont = await resolveCertificateFont(templateDoc, namePlacement, customFonts);
    const page = templateDoc.getPages()[0];
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const shortestSide = Math.min(pageWidth, pageHeight);
    const pageCenterX = pageWidth * clamp(namePlacement.centerXPercent, 0, 100) / 100;
    const recipientName = namePlacement.forceUppercase
      ? entry.recipientName.trim().toUpperCase()
      : entry.recipientName.trim();
    const recipientNameSize = fitTextSizeToWidth({
      text: recipientName,
      font: certificateFont,
      maxSize: shortestSide * clamp(namePlacement.fontSizePercent, 1.5, 12) / 100,
      minSize: shortestSide * 0.025,
      maxWidth: pageWidth * clamp(namePlacement.maxWidthPercent, 10, 95) / 100,
    });
    const recipientNameHeight = certificateFont.heightAtSize(recipientNameSize);
    const recipientCenterYFromTop =
      pageHeight * clamp(namePlacement.centerYPercent, 0, 100) / 100;
    const recipientBaselineY =
      pageHeight - recipientCenterYFromTop - recipientNameHeight / 2;

    drawText({
      pageCenterX,
      page,
      text: recipientName,
      y: recipientBaselineY,
      size: recipientNameSize,
      font: certificateFont,
      color: accent,
      align: namePlacement.textAlign,
      maxWidth: pageWidth * clamp(namePlacement.maxWidthPercent, 10, 95) / 100,
      underline: namePlacement.underline,
    });

    if (codePlacement.qr.enabled && entry.qrCodeDataUrl) {
      const qrImage = await templateDoc.embedPng(await dataUrlToBytes(entry.qrCodeDataUrl));
      const qrSize =
        shortestSide * clamp(codePlacement.qr.sizePercent, 3, 35) / 100;
      const qrCenterX =
        pageWidth * clamp(codePlacement.qr.centerXPercent, 0, 100) / 100;
      const qrCenterYFromTop =
        pageHeight * clamp(codePlacement.qr.centerYPercent, 0, 100) / 100;

      page.drawImage(qrImage, {
        x: qrCenterX - qrSize / 2,
        y: pageHeight - qrCenterYFromTop - qrSize / 2,
        width: qrSize,
        height: qrSize,
      });
    }

    if (codePlacement.barcode.enabled && entry.barcodeDataUrl) {
      const barcodeImage = await templateDoc.embedPng(
        await dataUrlToBytes(entry.barcodeDataUrl),
      );
      const barcodeWidth =
        pageWidth * clamp(codePlacement.barcode.widthPercent, 5, 80) / 100;
      const barcodeHeight =
        pageHeight * clamp(codePlacement.barcode.heightPercent, 2, 30) / 100;
      const barcodeCenterX =
        pageWidth * clamp(codePlacement.barcode.centerXPercent, 0, 100) / 100;
      const barcodeCenterYFromTop =
        pageHeight * clamp(codePlacement.barcode.centerYPercent, 0, 100) / 100;

      page.drawImage(barcodeImage, {
        x: barcodeCenterX - barcodeWidth / 2,
        y: pageHeight - barcodeCenterYFromTop - barcodeHeight / 2,
        width: barcodeWidth,
        height: barcodeHeight,
      });
    }

    const personalizedBytes = await templateDoc.save();
    const personalizedDoc = await PDFDocument.load(personalizedBytes);
    const [copiedPage] = await batchDoc.copyPages(personalizedDoc, [0]);
    batchDoc.addPage(copiedPage);
  }

  const saved = await batchDoc.save();
  return new Blob([new Uint8Array(saved)], { type: "application/pdf" });
}
