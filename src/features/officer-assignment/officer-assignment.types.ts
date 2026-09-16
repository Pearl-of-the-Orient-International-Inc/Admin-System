export type CreateOfficerAssignmentRequest = {
  officeTitleId: string;
  department?: string;
  region?: string;
  province?: string;
  cityMunicipality?: string;
  barangay?: string;
  startDate?: string;
};

export type ReplaceOfficerAssignmentRequest = {
  replacementMemberId: string;
  startDate?: string;
};

export type OfficerAssignmentResource = {
  id: string;
  memberId: string;
  officeTitleId: string;
  department: string | null;
  region: string | null;
  province: string | null;
  cityMunicipality: string | null;
  barangay: string | null;
  isActive: boolean;
  isPublic: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  officeTitle: {
    id: string;
    name: string;
    level: string;
    maxSlots: number | null;
    isActive: boolean;
    isPublic: boolean;
  };
  member?: {
    id: string;
    uniqueId: string | null;
    firstName: string;
    middleInitial: string | null;
    lastName: string;
    extensionName: string | null;
    memberType: string;
    status: string;
    isActive: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      role: string;
    };
  };
};

export type OfficerAssignmentEnvelopeResponse = {
  code: string;
  message: string;
  data: OfficerAssignmentResource;
};

export type OfficerAssignmentListResponse = {
  code: string;
  message: string;
  data: OfficerAssignmentResource[];
};

export type OfficerAssignmentsQueryParams = {
  activeOnly?: boolean;
};
