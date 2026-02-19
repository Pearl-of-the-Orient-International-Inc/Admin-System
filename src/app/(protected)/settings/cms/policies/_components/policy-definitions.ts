export type PolicyCategory = "legal" | "ministry" | "platform" | "governance";

export type PolicyItem = {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  content: string;
  isPublished: boolean;
  lastUpdated: string | null;
};

export const POLICY_IDS = {
  PRIVACY: "privacy-policy",
  INTELLECTUAL_PROPERTY: "intellectual-property",
  LEGAL_NOTICE: "legal-notice",
  TERMS_AND_CONDITIONS: "terms-and-conditions",
  SAFEGUARDING_CONFIDENTIALITY: "safeguarding-and-confidentiality",
  COOKIE_POLICY: "cookie-policy",
  DISPUTE_RESOLUTION: "dispute-resolution",
  DATA_RETENTION: "data-retention",
  WORSHIP_GUIDELINES: "worship-and-liturgy-guidelines",
  CHAPLAINCY_CARE: "chaplaincy-care-protocol",
  SACRAMENTAL_RECORDS: "sacramental-and-ministry-records",
  VOLUNTEER_CODE: "volunteer-and-minister-code",
  EVENT_PARTICIPATION: "event-and-retreat-participation",
  TRAINING_CERTIFICATION: "formation-training-and-certification",
  CONTENT_PUBLICATION: "content-and-communications-policy",
  ACCEPTABLE_USE: "acceptable-use-policy",
  ACCESS_CONTROL: "role-access-and-account-security",
  INCIDENT_REPORTING: "incident-reporting-and-escalation",
  DONATIONS_STEWARDSHIP: "donations-and-stewardship",
  FINANCIAL_TRANSPARENCY: "financial-transparency-and-audit",
} as const;

export const DEFAULT_POLICIES: Omit<
  PolicyItem,
  "content" | "isPublished" | "lastUpdated"
>[] = [
  {
    id: POLICY_IDS.PRIVACY,
    name: "Privacy policy",
    description:
      "How personal, pastoral, and ministry data is collected, used, and protected.",
    category: "legal",
  },
  {
    id: POLICY_IDS.INTELLECTUAL_PROPERTY,
    name: "Intellectual property",
    description:
      "Ownership and permitted use of sermons, study materials, media, and brand assets.",
    category: "legal",
  },
  {
    id: POLICY_IDS.LEGAL_NOTICE,
    name: "Legal notice",
    description:
      "Official legal identity, contact channels, and jurisdiction for legal concerns.",
    category: "legal",
  },
  {
    id: POLICY_IDS.TERMS_AND_CONDITIONS,
    name: "Terms and conditions",
    description:
      "General terms for using the seminary, worship, and chaplaincy platform.",
    category: "legal",
  },
  {
    id: POLICY_IDS.SAFEGUARDING_CONFIDENTIALITY,
    name: "Safeguarding and confidentiality",
    description:
      "Protection standards for children, vulnerable persons, and confidential care records.",
    category: "legal",
  },
  {
    id: POLICY_IDS.COOKIE_POLICY,
    name: "Cookie policy",
    description:
      "How cookies and related technologies are used for secure and usable platform access.",
    category: "legal",
  },
  {
    id: POLICY_IDS.DISPUTE_RESOLUTION,
    name: "Dispute resolution",
    description:
      "Process for handling disagreements involving members, ministry workers, and administrators.",
    category: "legal",
  },
  {
    id: POLICY_IDS.DATA_RETENTION,
    name: "Data retention",
    description:
      "Retention periods and deletion standards for records, logs, and archived materials.",
    category: "legal",
  },
  {
    id: POLICY_IDS.WORSHIP_GUIDELINES,
    name: "Worship and liturgy guidelines",
    description:
      "Standards for worship planning, liturgical practice, and service conduct.",
    category: "ministry",
  },
  {
    id: POLICY_IDS.CHAPLAINCY_CARE,
    name: "Chaplaincy care protocol",
    description:
      "Guidelines for spiritual counseling, visitation, referrals, and care documentation.",
    category: "ministry",
  },
  {
    id: POLICY_IDS.SACRAMENTAL_RECORDS,
    name: "Sacramental and ministry records",
    description:
      "Policy for recording, updating, and validating sacramental and ministry records.",
    category: "ministry",
  },
  {
    id: POLICY_IDS.VOLUNTEER_CODE,
    name: "Volunteer and minister code of conduct",
    description:
      "Behavior and ethical expectations for clergy, chaplains, volunteers, and staff.",
    category: "ministry",
  },
  {
    id: POLICY_IDS.EVENT_PARTICIPATION,
    name: "Event and retreat participation policy",
    description:
      "Participation rules for worship events, retreats, seminars, and ministry programs.",
    category: "ministry",
  },
  {
    id: POLICY_IDS.TRAINING_CERTIFICATION,
    name: "Formation, training, and certification",
    description:
      "Requirements for course completion, ministry formation, and certification records.",
    category: "ministry",
  },
  {
    id: POLICY_IDS.CONTENT_PUBLICATION,
    name: "Content and communications policy",
    description:
      "Review and publication standards for announcements, devotionals, and teaching resources.",
    category: "platform",
  },
  {
    id: POLICY_IDS.ACCEPTABLE_USE,
    name: "Acceptable use policy",
    description:
      "Allowed and prohibited actions for users of the admin and member platforms.",
    category: "platform",
  },
  {
    id: POLICY_IDS.ACCESS_CONTROL,
    name: "Role access and account security",
    description:
      "Role-based permissions, account controls, password standards, and session security.",
    category: "platform",
  },
  {
    id: POLICY_IDS.INCIDENT_REPORTING,
    name: "Incident reporting and escalation",
    description:
      "Process for reporting safeguarding, security, and conduct incidents with escalation paths.",
    category: "governance",
  },
  {
    id: POLICY_IDS.DONATIONS_STEWARDSHIP,
    name: "Donations and stewardship policy",
    description:
      "How donations, offerings, and designated funds are received, recorded, and stewarded.",
    category: "governance",
  },
  {
    id: POLICY_IDS.FINANCIAL_TRANSPARENCY,
    name: "Financial transparency and audit",
    description:
      "Reporting cadence, accountability controls, and audit requirements for ministry finances.",
    category: "governance",
  },
];

const SEEDED_POLICY_DATA: Record<
  string,
  { content: string; isPublished: boolean; lastUpdated: string }
> = {
  [POLICY_IDS.PRIVACY]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Information we collect

- Account details such as name, email, ministry role, and organization unit.
- Ministry records such as attendance, formation progress, and pastoral care notes where authorized.
- Technical logs such as sign-in history, device information, and access events.

2. How information is used

- To operate seminary formation, worship administration, and chaplaincy services.
- To communicate schedules, announcements, and important pastoral updates.
- To protect platform security, prevent misuse, and support incident reviews.

3. Protection and sharing

- Access is restricted based on role and ministry assignment.
- Sensitive records are shared only with authorized personnel and only when required for ministry care, legal compliance, or safeguarding.

4. User rights

- Users may request access, correction, or deletion of eligible personal data subject to legal and ministry recordkeeping obligations.`,
  },
  [POLICY_IDS.SAFEGUARDING_CONFIDENTIALITY]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Safeguarding commitment

- The organization maintains a zero-tolerance approach to abuse, exploitation, and neglect.
- All ministry workers must follow safeguarding standards for children and vulnerable persons.

2. Confidentiality standards

- Pastoral counseling notes and chaplaincy reports are confidential and shared on a strict need-to-know basis.
- Confidential information must not be discussed in public channels or outside approved ministry workflows.

3. Mandatory reporting

- Any safeguarding concern must be reported immediately through official incident channels.
- Emergency and legal reporting requirements must be followed according to applicable law and organizational protocol.`,
  },
  [POLICY_IDS.WORSHIP_GUIDELINES]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Planning and preparation

- Worship services must follow approved liturgical calendars and ministry schedules.
- Assigned leaders are responsible for readiness of readings, music, prayers, and service flow.

2. Conduct during services

- Leaders and volunteers must model reverence, inclusivity, and orderly conduct.
- Any adaptation to worship flow should respect doctrinal guidance and local ministry directives.

3. Documentation and review

- Service notes, attendance records, and major changes should be documented for ministry continuity.`,
  },
  [POLICY_IDS.CHAPLAINCY_CARE]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Scope of chaplaincy care

- Chaplaincy services include spiritual support, visitation, prayer, and referral for additional care.
- Care should be provided without discrimination and with respect for dignity and consent.

2. Care documentation

- Visit summaries and follow-up notes should be recorded accurately and promptly.
- Sensitive details should be limited to information required for continuity of care.

3. Referral and escalation

- Cases involving safety risks, abuse, or urgent medical or psychological needs must be escalated immediately to designated authorities and support teams.`,
  },
  [POLICY_IDS.ACCEPTABLE_USE]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Permitted use

- Users may access the platform only for legitimate ministry, seminary, and administration tasks.
- Credentials must be used only by the assigned account owner.

2. Prohibited actions

- Harassment, hate speech, intimidation, misinformation, or unauthorized disclosure of records.
- Attempts to bypass access controls, scrape data, or interfere with platform operations.

3. Enforcement

- Violations may result in content removal, account suspension, role revocation, or formal disciplinary action.`,
  },
  [POLICY_IDS.INCIDENT_REPORTING]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Reportable incidents

- Safeguarding concerns, data exposure, harassment, access abuse, and major policy violations.

2. Reporting timeline

- Critical incidents must be reported immediately.
- Non-critical incidents should be submitted within 24 hours of discovery.

3. Escalation and response

- Reports are triaged by designated governance leads.
- Investigation outcomes, corrective actions, and prevention steps must be documented.`,
  },
  [POLICY_IDS.DONATIONS_STEWARDSHIP]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Receiving donations

- Donations and offerings must be logged with date, amount, source, and purpose where applicable.
- Restricted donations must be used only for their designated purpose.

2. Stewardship controls

- At least two authorized personnel should participate in counting and reconciliation processes.
- Records must be complete, traceable, and available for authorized review.

3. Communication with donors

- Donors should receive acknowledgment and, where required, official documentation for contributions.`,
  },
  [POLICY_IDS.FINANCIAL_TRANSPARENCY]: {
    lastUpdated: "2026-02-19",
    isPublished: true,
    content: `1. Financial reporting

- Regular reports must summarize ministry income, expenses, and balances by program and period.
- Leadership and finance committees receive reports according to approved governance schedules.

2. Audit and review

- Internal reviews and external audits may be conducted based on policy, legal requirements, or board direction.
- Supporting documents must be retained and made available to authorized auditors.

3. Accountability

- Any discrepancy, irregularity, or misuse concern must be escalated immediately for investigation and corrective action.`,
  },
};

export function createInitialPolicyState(): PolicyItem[] {
  return DEFAULT_POLICIES.map((policy) => {
    const seeded = SEEDED_POLICY_DATA[policy.id];
    return {
      ...policy,
      content: seeded?.content ?? "",
      isPublished: seeded?.isPublished ?? false,
      lastUpdated: seeded?.lastUpdated ?? null,
    };
  });
}

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  legal: "Legal",
  ministry: "Ministry",
  platform: "Platform",
  governance: "Governance",
};
