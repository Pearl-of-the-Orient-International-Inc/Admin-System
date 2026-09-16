export type BulletinEntryType =
  | "NOTICE"
  | "ANNOUNCEMENT"
  | "MEMO"
  | "EVENT"
  | "OTHER";

export type BulletinEntryStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED";

export type BulletinEntryRecord = {
  id: string;
  title: string;
  content: string;
  type: BulletinEntryType;
  status: BulletinEntryStatus;
  publicationDate: string | null;
  scheduledAt: string | null;
  authorName: string | null;
  issuingOffice: string | null;
  featuredImageUrl: string | null;
  featuredImageFileName: string | null;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
  authorUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type BulletinEntryPayload = {
  title: string;
  content: string;
  type: BulletinEntryType;
  status: BulletinEntryStatus;
  publicationDate?: string | null;
  scheduledAt?: string | null;
  authorName?: string | null;
  issuingOffice?: string | null;
  featuredImageUrl?: string | null;
  featuredImageFileName?: string | null;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  attachmentMimeType?: string | null;
};

export type BulletinEntryQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: BulletinEntryType;
  status?: BulletinEntryStatus;
  sortBy?: "createdAt" | "updatedAt" | "publicationDate" | "scheduledAt" | "title";
  sortOrder?: "asc" | "desc";
};

export type BulletinListResponse = {
  code: string;
  message: string;
  data: BulletinEntryRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type BulletinEnvelopeResponse = {
  code: string;
  message: string;
  data: BulletinEntryRecord;
};

export type UploadedBulletinFile = {
  key: string;
  name: string;
  size: number;
  serverData: {
    userId: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
  ufsUrl: string;
  url: string;
};
