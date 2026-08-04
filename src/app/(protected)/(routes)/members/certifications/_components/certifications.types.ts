export type CertificateNamePlacement = {
  centerXPercent: number;
  centerYPercent: number;
  maxWidthPercent: number;
  fontSizePercent: number;
  colorHex: string;
  forceUppercase: boolean;
};

export type CertificateQrPlacement = {
  enabled: boolean;
  centerXPercent: number;
  centerYPercent: number;
  sizePercent: number;
};

export type CertificateBarcodePlacement = {
  enabled: boolean;
  centerXPercent: number;
  centerYPercent: number;
  widthPercent: number;
  heightPercent: number;
};

export type CertificateCodePlacement = {
  qr: CertificateQrPlacement;
  barcode: CertificateBarcodePlacement;
};

export type UploadedCertificateLayout = {
  id: string;
  name: string;
  previewUrl: string;
  fileName: string;
  pageWidth: number;
  pageHeight: number;
  namePlacement: CertificateNamePlacement;
  codePlacement: CertificateCodePlacement;
};

export type CertificatePreviewItem = {
  memberId: string;
  participantName: string;
  previewUrl: string;
  pageWidth: number;
  pageHeight: number;
};
