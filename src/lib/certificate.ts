import { PDFDocument, type PDFFont, type PDFPage, StandardFonts, rgb } from "pdf-lib";

type CertificateNamePlacement = {
  centerXPercent: number;
  centerYPercent: number;
  maxWidthPercent: number;
  fontSizePercent: number;
  colorHex: string;
  forceUppercase: boolean;
};

type CertificateBatchEntry = {
  recipientName: string;
};

type GenerateCertificateBatchPdfInput = {
  layoutUrl: string;
  entries: CertificateBatchEntry[];
  namePlacement?: CertificateNamePlacement;
};

const DEFAULT_NAME_PLACEMENT: CertificateNamePlacement = {
  centerXPercent: 50,
  centerYPercent: 49,
  maxWidthPercent: 62,
  fontSizePercent: 4.8,
  colorHex: "#034316",
  forceUppercase: true,
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

function drawCenteredText(params: {
  pageCenterX: number;
  page: PDFPage;
  text: string;
  y: number;
  size: number;
  font: PDFFont;
  color: ReturnType<typeof rgb>;
}) {
  const { pageCenterX, page, text, y, size, font, color } = params;
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: pageCenterX - textWidth / 2,
    y,
    size,
    font,
    color,
  });
}

export async function generateCertificateBatchPdf({
  layoutUrl,
  entries,
  namePlacement = DEFAULT_NAME_PLACEMENT,
}: GenerateCertificateBatchPdfInput): Promise<Blob> {
  const templateBytes = await fetchAsBytes(layoutUrl);
  const batchDoc = await PDFDocument.create();
  const accent = hexToRgb(namePlacement.colorHex);

  for (const entry of entries) {
    const templateDoc = await PDFDocument.load(templateBytes.slice());
    const serifBold = await templateDoc.embedFont(StandardFonts.TimesRomanBold);
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
      font: serifBold,
      maxSize: shortestSide * clamp(namePlacement.fontSizePercent, 1.5, 12) / 100,
      minSize: shortestSide * 0.025,
      maxWidth: pageWidth * clamp(namePlacement.maxWidthPercent, 10, 95) / 100,
    });
    const recipientNameHeight = serifBold.heightAtSize(recipientNameSize);
    const recipientCenterYFromTop =
      pageHeight * clamp(namePlacement.centerYPercent, 0, 100) / 100;
    const recipientBaselineY =
      pageHeight - recipientCenterYFromTop - recipientNameHeight / 2;

    drawCenteredText({
      pageCenterX,
      page,
      text: recipientName,
      y: recipientBaselineY,
      size: recipientNameSize,
      font: serifBold,
      color: accent,
    });

    const personalizedBytes = await templateDoc.save();
    const personalizedDoc = await PDFDocument.load(personalizedBytes);
    const [copiedPage] = await batchDoc.copyPages(personalizedDoc, [0]);
    batchDoc.addPage(copiedPage);
  }

  const saved = await batchDoc.save();
  return new Blob([new Uint8Array(saved)], { type: "application/pdf" });
}
