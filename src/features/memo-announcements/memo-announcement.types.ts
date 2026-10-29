export type MemoTemplateType =
  | "ANNOUNCEMENT"
  | "GENERAL_OFFICE"
  | "INCIDENT_REPORT"
  | "MEETING_NOTICE"
  | "POLICY_CHANGE"
  | "BLANK";

export type MemoStatus =
  | "DRAFT"
  | "REJECTED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "ARCHIVED";

export type MemoRecipientTarget = {
  type: "USER" | "MEMBER";
  id: string;
};

export type MemoRecipientScope = "SPECIFIC" | "ALL" | "OFFICERS";

export type MemoRecipientOption = {
  id: string;
  type: "USER" | "MEMBER";
  name: string;
  email: string;
  avatar: string | null;
  label: string;
  meta: string;
};

export type MemoRecipientRecord = {
  id: string;
  type: "USER" | "MEMBER";
  userId: string | null;
  memberId: string | null;
  name: string;
  email: string;
  createdAt: string;
};

export type MemoAttachmentRecord = {
  id: string;
  kind: "DOCX" | "PDF";
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
};

export type MemoDeliveryLogRecord = {
  id: string;
  recipientId: string;
  email: string;
  status: "PENDING" | "SENT" | "FAILED";
  messageId: string | null;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemoAnnouncementRecord = {
  id: string;
  referenceNumber: string;
  title: string;
  category: MemoTemplateType;
  customCategory: string | null;
  status: MemoStatus;
  summary: string | null;
  documentName: string;
  docxFilePath: string | null;
  pdfFilePath: string | null;
  pages: number | null;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  } | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  reviewNotes: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  recipients: MemoRecipientRecord[];
  attachments: MemoAttachmentRecord[];
  deliveryLogs: MemoDeliveryLogRecord[];
};

export type MemoAnnouncementListResponse = {
  code: string;
  message: string;
  data: MemoAnnouncementRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type MemoAnnouncementEnvelopeResponse = {
  code: string;
  message: string;
  data: MemoAnnouncementRecord;
};

export type MemoRecipientSearchResponse = {
  code: string;
  message: string;
  data: MemoRecipientOption[];
};

export type MemoAnnouncementQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: MemoTemplateType;
  status?: MemoStatus;
  sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "referenceNumber" | "title";
  sortOrder?: "asc" | "desc";
};

export type CreateMemoAnnouncementRequest = {
  title: string;
  category: MemoTemplateType;
  customCategory?: string | null;
  summary?: string | null;
  documentName: string;
  docxBase64?: string;
  recipientScope: MemoRecipientScope;
  recipientTargets: MemoRecipientTarget[];
};

export type UpdateMemoAnnouncementRequest = Partial<CreateMemoAnnouncementRequest>;

export type PublishMemoAnnouncementRequest = {
  id: string;
  documentName?: string;
  docxBase64?: string;
};
