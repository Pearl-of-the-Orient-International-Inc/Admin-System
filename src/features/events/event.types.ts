import type {
  EventCategory,
  EventMeetingPlatform,
  EventStatus,
  EventType,
  EventVisibility,
} from "@/enums";

export interface EventResource {
  id: string;
  name: string;
  category: EventCategory;
  type: EventType;
  location: string | null;
  onlineLink: string | null;
  meetingPlatform: EventMeetingPlatform | null;
  meetingId: string | null;
  meetingPassword: string | null;
  description: string;
  thumbnailUrl: string;
  organizer: string;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  visibility: EventVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface EventPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EventListResponse {
  code: string;
  message: string;
  data: EventResource[];
  pagination: EventPagination;
}

export interface EventEnvelopeResponse {
  code: string;
  message: string;
  data: EventResource;
}

export interface EventAttendeeResource {
  id: string;
  memberId: string;
  accessLevel: "FULL_ACCESS";
  inviteStatus: "INVITED" | "ACCEPTED";
  invitedAt: string;
  updatedAt: string;
  member: {
    id: string;
    fullName: string;
    email: string;
    avatar: string | null;
    userId: string;
  };
}

export interface EventAttendeesResponse {
  code: string;
  message: string;
  data: EventAttendeeResource[];
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: EventCategory;
  type?: EventType;
  visibility?: EventVisibility;
  sortBy?: "createdAt" | "updatedAt" | "startsAt" | "name";
  sortOrder?: "asc" | "desc";
}

export interface CreateEventRequest {
  name: string;
  category: EventCategory;
  type: EventType;
  location?: string;
  onlineLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  description: string;
  thumbnailUrl: string;
  organizer: string;
  startsAt: string;
  endsAt: string;
  visibility: EventVisibility;
}

export type UpdateEventRequest = CreateEventRequest;

export interface UploadedEventThumbnail {
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

export interface InviteEventAttendeesRequest {
  eventId: string;
  memberIds: string[];
}
