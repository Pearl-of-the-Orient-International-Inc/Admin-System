import type { OfficeTitleLevel } from "@/enums";

export type OfficeTitleSectionType = "list" | "richtext";

export interface OfficeTitleSectionItem {
  id?: string;
  content: string;
}

export interface OfficeTitleSection {
  id?: string;
  title: string;
  type: OfficeTitleSectionType;
  items?: OfficeTitleSectionItem[];
  content?: string;
}

export interface OfficeTitleResource extends Record<string, unknown> {
  id: string;
  name: string;
  level: OfficeTitleLevel;
  description: string | null;
  maxSlots: number | null;
  sections: OfficeTitleSection[];
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  reportsToId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeTitlePagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OfficeTitleListResponse {
  code: string;
  message: string;
  data: OfficeTitleResource[];
  pagination: OfficeTitlePagination;
}

export interface OfficeTitleEnvelopeResponse {
  code: string;
  message: string;
  data: OfficeTitleResource;
}

export interface OfficeTitleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "title" | "level";
  sortOrder?: "asc" | "desc";
}

export interface CreateOfficeTitleRequest {
  name: string;
  level: OfficeTitleLevel;
  description?: string | null;
  maxSlots?: number | null;
  sections?: OfficeTitleSection[];
  isPublic?: boolean;
  sortOrder?: number;
  reportsToId?: string | null;
}

export interface UpdateOfficeTitleRequest {
  name?: string;
  level?: OfficeTitleLevel;
  description?: string | null;
  maxSlots?: number | null;
  sections?: OfficeTitleSection[];
  isPublic?: boolean;
  sortOrder?: number;
  reportsToId?: string | null;
}
