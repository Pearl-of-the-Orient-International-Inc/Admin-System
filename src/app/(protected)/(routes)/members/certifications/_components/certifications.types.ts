export type CertificateNamePlacement = {
  centerXPercent: number;
  centerYPercent: number;
  maxWidthPercent: number;
  fontSizePercent: number;
  colorHex: string;
  forceUppercase: boolean;
};

export type UploadedCertificateLayout = {
  id: string;
  name: string;
  previewUrl: string;
  fileName: string;
  pageWidth: number;
  pageHeight: number;
  namePlacement: CertificateNamePlacement;
};

export type CertificatePreviewItem = {
  memberId: string;
  participantName: string;
  previewUrl: string;
  pageWidth: number;
  pageHeight: number;
};
