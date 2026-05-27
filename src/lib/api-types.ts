import {
  CivilStatus,
  EventCategory,
  EventStatus,
  EventType,
  Gender,
  MemberStatus,
  MemberType,
  UserAccountStatus,
  UserPosition,
  UserType,
} from "@/enums";

export type ApiCode =
  | "OK"
  | "CREATED"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export interface ApiErrorIssue {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message?: string;
  errors?: ApiErrorIssue[];
  requiresVerification?: boolean;
  error?: unknown;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserType;
  position?: UserPosition | null;
  accountStatus?: UserAccountStatus;
  createdAt: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorSetupResponse {
  code: string;
  message: string;
  data: TwoFactorSetupData;
}

export interface PasskeyStatusResponse {
  code: string;
  message: string;
  data: {
    hasPasskey: boolean;
    count: number;
  };
}

export interface PasskeyOptionsResponse<TOptions = unknown> {
  code: string;
  message: string;
  data: {
    options: TOptions;
    label?: string | null;
  };
}

export interface UserSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiredAt: string;
  isCurrent: boolean;
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
    label: string;
    coordinates: {
      lat: number;
      lng: number;
    } | null;
  };
}

export interface UserSessionsResponse {
  code: string;
  message: string;
  data: {
    currentSession: UserSession | null;
    sessions: UserSession[];
  };
}

export interface AuthSuccessResponse {
  code: string;
  message: string;
  user: UserPublic;
  accessToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface VerifyEmailResponse {
  code: string;
  message: string;
  user: UserPublic;
}

export interface UserEnvelopeResponse {
  user: UserPublic;
}

export interface UserListResponse {
  total: number;
  users: UserPublic[];
  limit?: number;
  offset?: number;
  totalPages?: number;
  currentPage?: number;
  hasMore?: boolean;
}

export interface CreateUserAccountResponse {
  code: ApiCode;
  message: string;
  user: UserPublic;
}

export interface MemberPublic {
  id: string;
  userId: string;
  status: MemberStatus;
  memberType: MemberType;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberTaggedEventSummary {
  id: string;
  taggedAt: string;
  event: {
    id: string;
    name: string;
    category: string;
    type: string;
    location: string | null;
    onlineLink: string | null;
    startsAt: string;
    endsAt: string;
    visibility: string;
    organizer: string;
    thumbnailUrl: string;
  };
}

export interface AdminMember {
  id: string;
  uniqueId: string | null;
  userId: string;
  status: MemberStatus;
  memberType: MemberType;
  firstName: string;
  middleInitial: string | null;
  lastName: string;
  extensionName: string | null;
  badgeNumber: string | null;
  profileBannerUrl: string | null;
  mobilePhoneNumber: string | null;
  homeAddress: string | null;
  civilStatus: CivilStatus | null;
  gender: Gender;
  nationality: string | null;
  dateOfBirth: string;
  region: string | null;
  province: string | null;
  municipalityCity: string | null;
  barangay: string | null;
  emergencyContactName: string | null;
  emergencyContactMobile: string | null;
  churchAffiliation: string | null;
  churchAddress: string | null;
  currentPositionRole: string | null;
  currentPositionRoleOther: string | null;
  height: string | null;
  weight: string | null;
  bloodType: string | null;
  colorOfEyes: string | null;
  colorOfSkin: string | null;
  sssNumber: string | null;
  tinNumber: string | null;
  skillsTalents: string | null;
  preferredBranchOther: string | null;
  elementarySchool: string | null;
  secondarySchool: string | null;
  tertiaryCollege: string | null;
  postGraduateStudies: string | null;
  ministerialExperiences?: {
    id: string;
    roleDescription: string;
    yearsApprox: string;
    order: number;
  }[];
  characterReferences?: {
    id: string;
    name: string;
    positionRelationship: string;
    contactNumber: string;
    order: number;
  }[];
  applicantRequirements?: {
    id: string;
    type: string;
    reviewStatus: string;
    fileUrl: string;
    fileName: string | null;
    mimeType: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  onboardingProgress?: {
    currentStep: string;
    preOrientationCompletedLessonIds: number[];
    preOrientationCompletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  paymentCheckout?: {
    id: string;
    paymentMethod: string;
    proofOfPaymentUrl: string | null;
    isPromissoryNote: boolean;
    promissoryNoteUrl: string | null;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  onlineInterviewAppointment?: {
    id: string;
    interviewerId: string;
    interviewerName: string;
    day: string;
    timeSlot: string;
    zoomLink: string;
    meetingId: string | null;
    passcode: string | null;
    confirmedAt: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  idGenerationAsset?: {
    id: string;
    profileUrl: string;
    qrCodeUrl: string;
    certificateUrl: string;
    generatedAt: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  chaplaincyTrainingProgress?: {
    id: string;
    completedLessonIds: number[];
    essayAnswers: unknown;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  preferredBranches?: {
    id: string;
    title: string;
  }[];
  taggedEvents?: MemberTaggedEventSummary[];
  signature?: {
    id: string;
    type: string;
    signatureData: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: Pick<UserPublic, "id" | "name" | "email" | "avatar" | "role">;
}

export interface MembersPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MemberListResponse {
  code: ApiCode;
  message: string;
  data: AdminMember[];
  pagination: MembersPagination;
}

export interface MemberEnvelopeResponse {
  code: ApiCode;
  message: string;
  data: AdminMember;
}

export interface MembershipReportTrendPoint {
  month: string;
  applications: number;
  approvals: number;
  archived: number;
  activeTotal: number;
  approvalRate: number;
}

export interface MembershipReportBreakdownItem {
  label: string;
  value: number;
  percentage: number;
  fill?: string;
}

export interface MembershipReportInsightItem {
  title: string;
  value: string;
  detail: string;
}

export interface MembershipReportData {
  summary: {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    approvalRate: number;
    newThisMonth: number;
    monthOverMonthGrowth: number;
    onboardingMembers: number;
    archivedMembers: number;
  };
  trendData: MembershipReportTrendPoint[];
  statusBreakdown: MembershipReportBreakdownItem[];
  typeBreakdown: MembershipReportBreakdownItem[];
  onboardingBreakdown: MembershipReportBreakdownItem[];
  branchBreakdown: MembershipReportBreakdownItem[];
  insights: MembershipReportInsightItem[];
}

export interface MembershipReportResponse {
  code: ApiCode;
  message: string;
  data: MembershipReportData;
}

export interface MinistryReportTrendPoint {
  month: string;
  total: number;
  onsite: number;
  online: number;
  completed: number;
}

export interface MinistryReportBreakdownItem {
  label: string;
  value: number;
  percentage: number;
  fill?: string;
  detail?: string;
}

export interface MinistryReportUpcomingItem {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  startsAtLabel: string;
  daysAwayLabel: string;
}

export interface MinistryReportInsightItem {
  title: string;
  value: string;
  detail: string;
}

export interface MinistryReportData {
  summary: {
    totalEvents: number;
    upcomingEvents: number;
    activeBranches: number;
    branchCoverageRate: number;
    leadershipCoverageRate: number;
    filledLeadershipSlots: number;
    openLeadershipSlots: number;
    onlineShare: number;
  };
  trendData: MinistryReportTrendPoint[];
  categoryBreakdown: MinistryReportBreakdownItem[];
  statusBreakdown: MinistryReportBreakdownItem[];
  branchBreakdown: MinistryReportBreakdownItem[];
  leadershipBreakdown: MinistryReportBreakdownItem[];
  upcomingEvents: MinistryReportUpcomingItem[];
  insights: MinistryReportInsightItem[];
}

export interface MinistryReportResponse {
  code: ApiCode;
  message: string;
  data: MinistryReportData;
}

export interface DashboardReportSummary {
  totalMembers: number;
  approvedMembers: number;
  pendingApplications: number;
  urgentPendingApplications: number;
  thisWeeksEvents: number;
  onlineEventsThisWeek: number;
}

export interface DashboardTrendPoint {
  month: string;
  applications: number;
  approvals: number;
  events: number;
}

export interface DashboardOnboardingItem {
  label: string;
  value: number;
  percentage: number;
  fill: string;
}

export interface DashboardCalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  type: EventType;
  status: EventStatus;
  startsAt: string;
  endsAt: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

export interface DashboardUpcomingEventResource {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  type: EventType;
  category: EventCategory;
  attendees: number;
  location: string;
}

export interface DashboardReportData {
  summary: DashboardReportSummary;
  membershipTrend: DashboardTrendPoint[];
  onboardingBreakdown: DashboardOnboardingItem[];
  calendarEvents: DashboardCalendarEvent[];
  upcomingEvents: DashboardUpcomingEventResource[];
}

export interface DashboardReportResponse {
  code: ApiCode;
  message: string;
  data: DashboardReportData;
}

export interface MemberLocationBreakdownItem {
  label: string;
  value: number;
  percentage: number;
  fill: string;
}

export interface MemberLocationTrendSeries {
  key: string;
  label: string;
  total: number;
  color: string;
}

export interface MemberLocationTrendPoint {
  month: string;
  [key: string]: string | number;
}

export interface MemberLocationReportData {
  summary: {
    totalActiveMembers: number;
    membersWithLocation: number;
    membersWithoutLocation: number;
    granularity: "province" | "municipality" | "barangay";
    scopeLabel: string;
  };
  regionBreakdown: MemberLocationBreakdownItem[];
  locationTrend: {
    granularity: "province" | "municipality" | "barangay";
    series: MemberLocationTrendSeries[];
    data: MemberLocationTrendPoint[];
  };
}

export interface MemberLocationReportResponse {
  code: ApiCode;
  message: string;
  data: MemberLocationReportData;
}

export interface CreateMemberByAdminResponse {
  code: ApiCode;
  message: string;
  data: {
    createdUser: boolean;
    emailSent: boolean;
    user: UserPublic;
    member: MemberPublic;
  };
}
