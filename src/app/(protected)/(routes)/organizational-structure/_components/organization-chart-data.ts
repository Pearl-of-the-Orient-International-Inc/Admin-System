export type ChartRoleGroup = {
  title: string
  items: string[]
}

export type OrganizationChartProfile = {
  id: string
  organizationName: string
  chiefChaplain: string
  topRoles: string[]
  groups: ChartRoleGroup[]
}

export const organizationChartProfiles: OrganizationChartProfile[] = [
  {
    id: "pearl-of-the-orient",
    organizationName:
      "PEARL OF THE ORIENT INTERNATIONAL AUXILIARY CHAPLAIN VALUES EDUCATORS INC.",
    chiefChaplain: "Bishop Dr. Rodel R. Manzo",
    topRoles: ["General Secretary", "Legal Adviser"],
    groups: [
      {
        title: "Ministry / Services",
        items: [
          "School Chaplaincy",
          "Training and Seminars",
          "Follow-Up Visitation",
          "Community",
          "Ordination",
          "Devotion and Bible Study",
          "Pastoral Care",
          "Solemnize Marriage",
          "Pastoral Counseling",
          "Spiritual Enhancement",
          "Moral Values and Spiritual Upliftment",
        ],
      },
      {
        title: "Administration",
        items: [
          "Human Resource",
          "Information Technology",
          "Accounting",
          "Logistics",
          "Maintenance",
        ],
      },
      {
        title: "National Director & Deputy Director",
        items: [
          "Regional Director & Director",
          "Provincial Director & Director",
          "City & Municipality Chaplain & Deputy Chaplain",
          "Barangay Chaplain & Deputy Chaplain",
          "Member",
        ],
      },
      {
        title: "Churches / Ministerial",
        items: [
          "Education",
          "Humanitarian",
          "Political Affairs & Communication",
          "Training & Development",
          "Social Welfare & Development",
          "Human Resources",
          "Membership & Recruitment",
          "Prison Ministry",
          "School / Colleges",
          "Security Group",
          "PNP",
        ],
      },
      {
        title: "Partners - NGO",
        items: [
          "WCEA",
          "JSL Group of Company",
          "AYAAN Enterprises Corporation",
          "L.A.A Health Talk with Dr. Larry",
          "Natural Bone Restoration",
        ],
      },
    ],
  },
]

export function getOrganizationChartProfile(organizationId: string) {
  const found = organizationChartProfiles.find(
    (profile) => profile.id === organizationId
  )

  if (found) return found

  if (organizationId === "main" || organizationId === "default") {
    const baseProfile = organizationChartProfiles[0]
    return {
      ...baseProfile,
      id: organizationId,
    }
  }

  return undefined
}
