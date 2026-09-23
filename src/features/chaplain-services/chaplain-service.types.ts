export type ChaplainServiceRecord = {
  id: string;
  name: string;
  description: string;
  availability: string | null;
  commissionPercent: number | null;
  maxConcurrentBookings: number;
  sharedResourceName: string | null;
  sharedResourceKey: string | null;
  sharedResourceCapacity: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ChaplainServicePayload = Omit<
  ChaplainServiceRecord,
  "id" | "createdAt" | "updatedAt" | "sharedResourceKey"
>;

export type ChaplainServiceListResponse = {
  code: string;
  message: string;
  data: ChaplainServiceRecord[];
};

export type ChaplainServiceResponse = {
  code: string;
  message: string;
  data: ChaplainServiceRecord;
};

export type ChaplainServiceBookingStatus =
  | "PENDING"
  | "AWAITING_CHAPLAIN_APPROVAL"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type ChaplainServiceBookingRecord = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  preferredAt: string;
  deliveryMethod: "ON_SITE" | "ONLINE" | "PHONE";
  locationDetails: string;
  notes: string | null;
  status: ChaplainServiceBookingStatus;
  statusReason: string | null;
  providerServiceFee: number | null;
  providerCommissionAmount: number | null;
  providerCommissionStatus: "NOT_APPLICABLE" | "PENDING" | "SETTLED" | "WAIVED";
  requesterPaymentStatus: "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  service: { id: string; name: string; commissionPercent: number | null };
  providerMember: {
    id: string;
    uniqueId: string | null;
    firstName: string;
    middleInitial: string | null;
    lastName: string;
    extensionName: string | null;
  };
  history: Array<{
    id: string;
    status: ChaplainServiceBookingStatus;
    reason: string | null;
    changedByUserId: string | null;
    createdAt: string;
  }>;
};

export type ChaplainServiceBookingListResponse = {
  code: string;
  message: string;
  data: ChaplainServiceBookingRecord[];
};

export type UpdateChaplainServiceBookingStatusPayload = {
  status: Exclude<ChaplainServiceBookingStatus, "PENDING">;
  reason?: string;
  preferredAt?: string;
  providerServiceFee?: number;
};

export type UpdateChaplainServiceBookingFinancialsPayload = {
  providerServiceFee?: number | null;
  requesterPaymentStatus?: ChaplainServiceBookingRecord["requesterPaymentStatus"];
  providerCommissionStatus?: ChaplainServiceBookingRecord["providerCommissionStatus"];
};
