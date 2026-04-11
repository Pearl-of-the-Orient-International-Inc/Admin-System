export type BranchSectionType = "list" | "richtext";

export interface BranchSectionItem {
  id?: string;
  content: string;
}

export interface BranchSection {
  id?: string;
  title: string;
  type: BranchSectionType;
  items?: BranchSectionItem[];
  content?: string;
}

export interface BranchServiceResource {
  [key: string]: unknown;
  id: string;
  title: string;
  description: string;
  sections: BranchSection[];
  memberCount?: number;
  memberId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BranchPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BranchServiceListResponse {
  code: string;
  message: string;
  data: BranchServiceResource[];
  pagination: BranchPagination;
}

export interface BranchServiceEnvelopeResponse {
  code: string;
  message: string;
  data: BranchServiceResource;
}

export interface BranchServiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateBranchServiceRequest {
  title: string;
  description: string;
  sections: BranchSection[];
}

export interface UpdateBranchServiceRequest {
  title?: string;
  description?: string;
  sections?: BranchSection[];
}
