export type EventStatus = "Scheduled" | "Ongoing" | "Completed" | "Cancelled";

export type EventRecord = {
  id: string;
  title: string;
  category: string;
  location: string;
  organizer: string;
  startsAt: string;
  status: EventStatus;
  imageUrl: string;
  excerpt: string;
  contentHtml: string;
};

export const eventRecords: EventRecord[] = [
  {
    id: "EVT-001",
    title: "National Chaplain Leadership Summit",
    category: "Conference",
    location: "Manila City",
    organizer: "Leadership Office",
    startsAt: "2026-03-25T09:00:00",
    status: "Scheduled",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "A nationwide gathering for regional and provincial chaplain leaders to align ministry direction and governance priorities.",
    contentHtml: `
      <p>The National Chaplain Leadership Summit gathers key leaders from across regions to align strategic direction for the year. Sessions focus on governance, leadership accountability, and practical ministry support for each office.</p>
      <h2>Why This Summit Matters</h2>
      <p>This event gives national, regional, and provincial directors one table for decision making. It helps teams coordinate priorities early and reduce overlap in programs and communication.</p>
      <ul>
        <li><strong>Alignment:</strong> Shared ministry direction and annual targets</li>
        <li><strong>Governance:</strong> Clear accountability and reporting standards</li>
        <li><strong>Operations:</strong> Practical implementation plans per region</li>
      </ul>
      <h2>Program Highlights</h2>
      <p>Breakout sessions are grouped by leadership scope to ensure each office gets specific, actionable guidance.</p>
      <ol>
        <li>Leadership and governance briefing</li>
        <li>Regional planning and KPI setting</li>
        <li>Commitment ceremony and deployment planning</li>
      </ol>
      <h3>Expected Output</h3>
      <p>Each branch leaves with a concrete roadmap and an agreed reporting timeline for quarterly progress reviews.</p>
    `,
  },
  {
    id: "EVT-002",
    title: "Community Feeding Program",
    category: "Outreach",
    location: "Cavite",
    organizer: "Humanitarian Ministry",
    startsAt: "2026-03-02T14:00:00",
    status: "Ongoing",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "An outreach event focused on food distribution, prayer support, and family ministry in underserved communities.",
    contentHtml: `
      <p>The Community Feeding Program combines food support with pastoral presence in partner barangays. Volunteers coordinate distribution, prayer circles, and values-sharing activities for families.</p>
      <h2>Service Focus</h2>
      <p>Beyond relief, this outreach is designed to build trusted relationships with communities and identify families for ongoing care support.</p>
      <ul>
        <li>Family prayer and ministry visitation</li>
        <li>Food and essentials distribution</li>
        <li>Follow-up and care referral mapping</li>
      </ul>
      <h2>Field Coordination</h2>
      <p>Teams are assigned by zone to improve logistics, maintain safety standards, and ensure all registered beneficiaries are served.</p>
    `,
  },
  {
    id: "EVT-003",
    title: "Pastoral Care Workshop",
    category: "Training",
    location: "Quezon City",
    organizer: "Education & Ministry",
    startsAt: "2026-02-20T13:00:00",
    status: "Completed",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "A workshop focused on counseling pathways, pastoral triage, and member care documentation standards.",
    contentHtml: `
      <p>The Pastoral Care Workshop equipped ministry workers with practical frameworks for counseling intake and case handling. Facilitators emphasized confidentiality, referral boundaries, and trauma-informed communication.</p>
      <h2>Core Competencies Covered</h2>
      <ul>
        <li>Case intake and triage flow</li>
        <li>Pastoral boundaries and referral handling</li>
        <li>Documentation standards for member care</li>
      </ul>
      <h2>Workshop Outcome</h2>
      <p>Participants completed guided case simulations and received templates for local office pastoral care implementation.</p>
    `,
  },
  {
    id: "EVT-004",
    title: "Youth Praise Night",
    category: "Worship",
    location: "Laguna",
    organizer: "Youth Development Office",
    startsAt: "2026-03-08T18:30:00",
    status: "Scheduled",
    imageUrl: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "An evening worship event for youth ministries featuring prayer, music, testimonies, and leadership mentoring.",
    contentHtml: `
      <p>Youth Praise Night creates space for worship, testimony, and discipleship through creative ministry expression. It also serves as an engagement touchpoint for young members entering leadership tracks.</p>
      <h2>Night Flow</h2>
      <ol>
        <li>Corporate worship and testimonies</li>
        <li>Small-group mentoring circles</li>
        <li>Prayer commissioning for youth leaders</li>
      </ol>
      <h2>Discipleship Goal</h2>
      <p>The ministry team will use attendance and mentoring notes to guide follow-up, membership care, and service placement.</p>
    `,
  },
  {
    id: "EVT-005",
    title: "Regional Volunteer Orientation",
    category: "Orientation",
    location: "Tarlac",
    organizer: "Operations Team",
    startsAt: "2026-02-27T10:00:00",
    status: "Cancelled",
    imageUrl: "https://images.unsplash.com/photo-1505238680356-667803448bb6?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "An orientation for incoming volunteers that was paused due to regional logistics and scheduling conflicts.",
    contentHtml: `
      <p>The Regional Volunteer Orientation was planned to onboard new ministry volunteers in operations and field coordination. Due to venue constraints and travel limitations, this schedule has been cancelled.</p>
      <h2>Cancellation Notes</h2>
      <ul>
        <li>Venue limitations during the target date window</li>
        <li>Regional travel restrictions for participants</li>
        <li>Insufficient lead time for support teams</li>
      </ul>
      <h2>What Happens Next</h2>
      <p>All registrants will receive updated schedules, onboarding instructions, and required pre-orientation documents from the Operations Team.</p>
    `,
  },
];

export function getEventById(eventId: string) {
  return eventRecords.find((event) => event.id === eventId);
}
