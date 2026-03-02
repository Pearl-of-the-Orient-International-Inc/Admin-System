export type OfficeUser = {
  id: string
  name: string
  email: string
  role: string
}

export const organizationUsers: OfficeUser[] = [
  { id: "USR-001", name: "Ps. Daniel Cruz", email: "daniel@pearlorient.org", role: "Senior Pastor" },
  { id: "USR-002", name: "Sis. Abigail Reyes", email: "abigail@pearlorient.org", role: "Worship Lead" },
  { id: "USR-003", name: "Bro. Nathan Santos", email: "nathan@pearlorient.org", role: "Education Lead" },
  { id: "USR-004", name: "Sis. Clarisse Mendoza", email: "clarisse@pearlorient.org", role: "Youth Director" },
  { id: "USR-005", name: "Bro. Elijah Garcia", email: "elijah@pearlorient.org", role: "Finance Officer" },
  { id: "USR-006", name: "Sis. Hannah Bautista", email: "hannah@pearlorient.org", role: "Outreach Coordinator" },
  { id: "USR-007", name: "Bro. Josiah dela Cruz", email: "josiah@pearlorient.org", role: "Prayer Coordinator" },
  { id: "USR-008", name: "Sis. Naomi Panganiban", email: "naomi@pearlorient.org", role: "Communications Lead" },
  { id: "USR-009", name: "Rev. Romel Arnel V. Roque", email: "romel@pearlorient.org", role: "Provincial Director" },
  { id: "USR-010", name: "Rev. Rodrigo C. Torres III", email: "rodrigo@pearlorient.org", role: "Deputy Director" },
  { id: "USR-011", name: "Chap Alejandro A. Salamanca", email: "alejandro@pearlorient.org", role: "City Chaplain" },
  { id: "USR-012", name: "Chap Norman S. Endozo", email: "norman@pearlorient.org", role: "Municipal Chaplain" },
]
