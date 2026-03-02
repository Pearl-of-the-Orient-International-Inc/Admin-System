export type OfficeStatus = "Active" | "Inactive"

export type Office = {
  id: string
  officeTitle: string
  department: string
  head: string
  jobDescription: string
  obligations: string
  dutiesAndResponsibilities: string
  status: OfficeStatus
  updatedAt: string
}

export const initialOfficeData: Office[] = [
  {
    id: "OFF-001",
    officeTitle: "Office of the Senior Pastor",
    department: "Leadership",
    head: "Ps. Daniel Cruz",
    jobDescription:
      "Provides spiritual and organizational direction for the entire church body.",
    obligations:
      "Ensure policy alignment, maintain pastoral oversight, and represent the organization in official activities.",
    dutiesAndResponsibilities:
      "Approve strategic decisions, mentor ministry heads, and oversee leadership development.",
    status: "Active",
    updatedAt: "2026-02-25",
  },
  {
    id: "OFF-002",
    officeTitle: "Worship and Music Ministry",
    department: "Worship",
    head: "Sis. Abigail Reyes",
    jobDescription:
      "Leads worship planning and execution for all regular and special gatherings.",
    obligations:
      "Coordinate with pastoral leadership and ensure doctrinally sound music selections.",
    dutiesAndResponsibilities:
      "Create schedules, train musicians and vocalists, and maintain worship service flow.",
    status: "Active",
    updatedAt: "2026-02-21",
  },
  {
    id: "OFF-003",
    officeTitle: "Christian Education",
    department: "Discipleship",
    head: "Bro. Nathan Santos",
    jobDescription:
      "Designs and manages biblical learning programs for all age groups.",
    obligations:
      "Maintain curriculum quality and align teaching materials with church values.",
    dutiesAndResponsibilities:
      "Prepare lessons, train teachers, and evaluate discipleship outcomes.",
    status: "Active",
    updatedAt: "2026-02-18",
  },
  {
    id: "OFF-004",
    officeTitle: "Youth Development Office",
    department: "Youth",
    head: "Sis. Clarisse Mendoza",
    jobDescription:
      "Oversees youth engagement, leadership formation, and values education.",
    obligations:
      "Provide safe mentoring spaces and coordinate youth-focused ministry programs.",
    dutiesAndResponsibilities:
      "Organize youth events, track participation, and support youth leaders.",
    status: "Active",
    updatedAt: "2026-02-20",
  },
  {
    id: "OFF-005",
    officeTitle: "Finance and Stewardship",
    department: "Operations",
    head: "Bro. Elijah Garcia",
    jobDescription:
      "Manages financial planning, budgeting, reporting, and stewardship communication.",
    obligations:
      "Ensure transparency, policy compliance, and proper handling of church funds.",
    dutiesAndResponsibilities:
      "Prepare reports, monitor budget use, and support audit and accountability processes.",
    status: "Active",
    updatedAt: "2026-02-26",
  },
  {
    id: "OFF-006",
    officeTitle: "Community Outreach",
    department: "Mission",
    head: "Sis. Hannah Bautista",
    jobDescription:
      "Plans and delivers community support initiatives and external mission efforts.",
    obligations:
      "Build partnerships and ensure social programs align with church mission.",
    dutiesAndResponsibilities:
      "Manage outreach schedules, coordinate volunteers, and document program impact.",
    status: "Inactive",
    updatedAt: "2026-01-30",
  },
  {
    id: "OFF-007",
    officeTitle: "Prayer and Intercession Office",
    department: "Prayer",
    head: "Bro. Josiah dela Cruz",
    jobDescription:
      "Leads church-wide prayer movements and intercession activities.",
    obligations:
      "Maintain confidentiality for sensitive requests and uphold pastoral protocols.",
    dutiesAndResponsibilities:
      "Facilitate prayer meetings, manage request channels, and mentor prayer leaders.",
    status: "Active",
    updatedAt: "2026-02-14",
  },
  {
    id: "OFF-008",
    officeTitle: "Media and Communications",
    department: "Operations",
    head: "Sis. Naomi Panganiban",
    jobDescription:
      "Supports church communication, branding, and multimedia production.",
    obligations:
      "Ensure communication consistency and timely publication of official announcements.",
    dutiesAndResponsibilities:
      "Manage content calendars, media assets, and live production support.",
    status: "Active",
    updatedAt: "2026-02-24",
  },
]
