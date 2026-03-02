export type MemberStatus = "Approved" | "Pending" | "Archived";

export type MemberRecord = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  civilStatus: string;
  branchOfService: string;
  status: MemberStatus;
  appliedAt: string;
};

export const memberRecords: MemberRecord[] = [
  {
    id: "MEM-001",
    fullName: "Juan Dela Cruz",
    email: "juan.delacruz@pearlorient.org",
    mobile: "09152479693",
    civilStatus: "Single",
    branchOfService: "Humanitarian",
    status: "Approved",
    appliedAt: "2026-02-18",
  },
  {
    id: "MEM-002",
    fullName: "Maria Santos",
    email: "maria.santos@pearlorient.org",
    mobile: "09172861120",
    civilStatus: "Married",
    branchOfService: "School",
    status: "Pending",
    appliedAt: "2026-02-26",
  },
  {
    id: "MEM-003",
    fullName: "Ronaldo Manalo",
    email: "ronaldo.manalo@pearlorient.org",
    mobile: "09234517890",
    civilStatus: "Widowed",
    branchOfService: "Military/PNP",
    status: "Approved",
    appliedAt: "2026-01-29",
  },
  {
    id: "MEM-004",
    fullName: "Elena Garcia",
    email: "elena.garcia@pearlorient.org",
    mobile: "09191239874",
    civilStatus: "Single",
    branchOfService: "Hospital and Care",
    status: "Archived",
    appliedAt: "2025-12-17",
  },
  {
    id: "MEM-005",
    fullName: "Noel Roland",
    email: "noel.roland@pearlorient.org",
    mobile: "09987653210",
    civilStatus: "Married",
    branchOfService: "Security",
    status: "Pending",
    appliedAt: "2026-02-28",
  },
];

export const branchOfServiceOptions = [
  "Humanitarian",
  "Hospital and Care",
  "Military/PNP",
  "School",
  "Corporate",
  "Disaster & Rescue Operations",
  "Prison",
  "Security",
  "Government",
  "DSWD",
  "Others",
];
