export type NewsBlogMediaItem = {
  id: string;
  kind: "image" | "video";
  fileName: string;
  previewUrl: string;
  file?: File | null;
};

export type NewsBlogTaggedMember = {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
};

export type NewsBlogRecord = {
  id: string;
  title: string;
  caption: string;
  isActive: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  platform: "FACEBOOK";
  media: NewsBlogMediaItem[];
  taggedMembers: NewsBlogTaggedMember[];
  hashtags: string[];
  updatedAt: string;
  createdAt: string;
  scheduledAt: string | null;
  publishedAt: string | null;
};

export interface NewsBlogListPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NewsBlogListResponse {
  code: string;
  message: string;
  data: Array<{
    id: string;
    title: string;
    caption: string;
    isActive: boolean;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
    platform: "FACEBOOK";
    hashtags: string[];
    scheduledAt: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    media: Array<{
      id: string;
      kind: "IMAGE" | "VIDEO";
      fileUrl: string;
      fileName: string;
      sortOrder: number;
      createdAt: string;
    }>;
    taggedMembers: Array<{
      id: string;
      memberId: string;
      taggedAt: string;
      member: {
        id: string;
        firstName: string;
        middleInitial: string | null;
        lastName: string;
        extensionName: string | null;
        fullName: string;
        user: {
          id: string;
          name: string;
          email: string;
          avatar: string | null;
        };
      };
    }>;
  }>;
  pagination: NewsBlogListPagination;
}

export interface NewsBlogEnvelopeResponse {
  code: string;
  message: string;
  data: NewsBlogListResponse["data"][number];
}

export interface NewsBlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  sortBy?: "createdAt" | "updatedAt" | "scheduledAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateNewsBlogRequest {
  title: string;
  caption: string;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  platform?: "FACEBOOK";
  media: Array<{
    kind: "IMAGE" | "VIDEO";
    fileUrl: string;
    fileName: string;
  }>;
  taggedMemberIds?: string[];
  hashtags: string[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
}

export type UpdateNewsBlogRequest = CreateNewsBlogRequest;

export interface UploadedNewsBlogMedia {
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
}
