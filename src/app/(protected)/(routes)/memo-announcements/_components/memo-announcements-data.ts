export type MemoTemplateType =
  | "ANNOUNCEMENT"
  | "GENERAL_OFFICE"
  | "INCIDENT_REPORT"
  | "MEETING_NOTICE"
  | "POLICY_CHANGE"
  | "BLANK";

export type MemoAnnouncementRecord = {
  id: string;
  title: string;
  fileName: string;
  category: MemoTemplateType;
  summary: string;
  issuedAt: string;
  updatedAt: string;
  pages: number;
  signatories: string[];
  author: string;
  accent: string;
};

export type MemoTemplateOption = {
  value: MemoTemplateType;
  title: string;
  description: string;
  iconSrc: string;
};

export type GeneralOfficeTemplateVariant =
  | "OFFICE_MEMORANDUM"
  | "LETTER_OF_INTENT"
  | "COURTESY_LETTER";

export type GeneralOfficeTemplateOption = {
  value: GeneralOfficeTemplateVariant;
  title: string;
  description: string;
};

export const generalOfficeTemplateOptions: GeneralOfficeTemplateOption[] = [
  {
    value: "OFFICE_MEMORANDUM",
    title: "Office Memorandum",
    description: "Standard internal office communication and directives.",
  },
  {
    value: "LETTER_OF_INTENT",
    title: "Letter of Intent",
    description: "Formal proposal to establish collaboration or partnership.",
  },
  {
    value: "COURTESY_LETTER",
    title: "Courtesy Letter",
    description: "Formal request for a courtesy call or introductory meeting.",
  },
];

export const memoTemplateOptions: MemoTemplateOption[] = [
  {
    value: "ANNOUNCEMENT",
    title: "Announcement",
    description:
      "Share organization-wide updates, public advisories, and important release notices.",
    iconSrc: "/icons/announcement.svg",
  },
  {
    value: "GENERAL_OFFICE",
    title: "General Office",
    description:
      "Draft standard office memoranda, internal directives, and administrative communications.",
    iconSrc: "/icons/general-office.svg",
  },
  {
    value: "INCIDENT_REPORT",
    title: "Incident Report",
    description:
      "Document incidents, observations, response notes, and submitted accountability details.",
    iconSrc: "/icons/incident-report.svg",
  },
  {
    value: "MEETING_NOTICE",
    title: "Meeting Notice",
    description:
      "Prepare meeting invitations, agenda notices, and attendance coordination documents.",
    iconSrc: "/icons/meeting-notice.svg",
  },
  {
    value: "POLICY_CHANGE",
    title: "Policy Change",
    description:
      "Announce policy revisions, operational adjustments, and updated compliance instructions.",
    iconSrc: "/icons/policy-change.svg",
  },
  {
    value: "BLANK",
    title: "Blank Template (Others)",
    description:
      "Start with a flexible template for specialized memo formats beyond the standard set.",
    iconSrc: "/icons/blank-template-others.svg",
  },
];

export const customMemoTemplateSuggestions = [
  "Personnel / HR",
  "Fellowship Activity",
  "Fellowship Committee Assignment",
  "Budget Request",
  "Values Education Program",
  "Values Integration Directive",
  "Recognition / Commendation",
  "Liturgical / Worship Activity",
  "Pastoral Care / Visitation",
  "Religious Formation / Retreat",
  "Chaplaincy Advisory",
  "Request / Authorization",
  "Compliance / Monitoring Reminder",
];

export const memoAnnouncementRecords: MemoAnnouncementRecord[] = [
  {
    id: "memo-001",
    title: "Quarterly Ministry Alignment",
    fileName: "Quarterly Ministry Alignment.pdf",
    category: "GENERAL_OFFICE",
    summary:
      "Operational memo outlining ministry goals, attendance targets, and service coordination priorities for the next quarter.",
    issuedAt: "2026-03-24T08:30:00+08:00",
    updatedAt: "2026-03-24T10:15:00+08:00",
    pages: 4,
    signatories: ["Ptr. Nathaniel Cruz", "Rev. Samuel Reyes"],
    author: "Office of the National Director",
    accent: "from-sky-500/18 via-cyan-400/10 to-transparent",
  },
  {
    id: "memo-002",
    title: "Holy Week Service Schedule",
    fileName: "Holy Week Service Schedule.pdf",
    category: "ANNOUNCEMENT",
    summary:
      "Public schedule of Holy Week gatherings, volunteer arrival windows, and branch coordination reminders for all officers.",
    issuedAt: "2026-03-23T13:00:00+08:00",
    updatedAt: "2026-03-23T17:40:00+08:00",
    pages: 2,
    signatories: ["Bishop Elias Monteverde"],
    author: "Communications Office",
    accent: "from-amber-500/18 via-orange-400/10 to-transparent",
  },
  {
    id: "memo-003",
    title: "Vehicle Incident Documentation",
    fileName: "Vehicle Incident Documentation.pdf",
    category: "INCIDENT_REPORT",
    summary:
      "Incident report covering field transport damage, personnel statements, and recommended next actions.",
    issuedAt: "2026-03-21T09:45:00+08:00",
    updatedAt: "2026-03-22T09:10:00+08:00",
    pages: 6,
    signatories: [
      "Ptr. Nathaniel Cruz",
      "Sis. Andrea Lopez",
      "Bro. Julian Santos",
    ],
    author: "Operations and Compliance",
    accent: "from-rose-500/18 via-orange-400/10 to-transparent",
  },
  {
    id: "memo-004",
    title: "National Council Meeting Notice",
    fileName: "National Council Meeting Notice.pdf",
    category: "MEETING_NOTICE",
    summary:
      "Formal notice for the upcoming national council session including date, venue, and agenda highlights.",
    issuedAt: "2026-03-18T11:20:00+08:00",
    updatedAt: "2026-03-20T15:00:00+08:00",
    pages: 3,
    signatories: ["Rev. Samuel Reyes", "Sis. Andrea Lopez"],
    author: "Executive Secretariat",
    accent: "from-violet-500/18 via-fuchsia-400/10 to-transparent",
  },
  {
    id: "memo-005",
    title: "Child Safety Policy Revision",
    fileName: "Child Safety Policy Revision.pdf",
    category: "MEETING_NOTICE",
    summary:
      "Policy revision memo announcing updated child protection procedures and reporting expectations.",
    issuedAt: "2026-03-16T07:50:00+08:00",
    updatedAt: "2026-03-16T08:05:00+08:00",
    pages: 5,
    signatories: ["Bishop Elias Monteverde", "Rev. Samuel Reyes"],
    author: "Executive Office",
    accent: "from-indigo-500/18 via-sky-400/10 to-transparent",
  },
  {
    id: "memo-006",
    title: "Chaplaincy Advisory Routing Guide",
    fileName: "Chaplaincy Advisory Routing Guide.pdf",
    category: "BLANK",
    summary:
      "Specialized template-driven memo for chaplaincy advisory routing, triage ownership, and document handling standards.",
    issuedAt: "2026-03-12T14:10:00+08:00",
    updatedAt: "2026-03-15T16:45:00+08:00",
    pages: 5,
    signatories: ["Ptr. Nathaniel Cruz"],
    author: "Pastoral Care Office",
    accent: "from-emerald-500/18 via-lime-400/10 to-transparent",
  },
];

export const formatMemoDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatMemoDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getMemoInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
