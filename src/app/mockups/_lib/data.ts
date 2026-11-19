/**
 * Fake data shared by every mockup. Real events come from the synced
 * RattlerTracks file (see `get-mock-events.ts`); everything here is made up
 * so the screens have something believable to show.
 */

export interface Interest {
  id: string;
  label: string;
}

export interface InterestGroup {
  id: string;
  label: string;
  interests: Interest[];
}

/** Interest tags students pick during onboarding (RE-13) and in settings. */
export const INTEREST_GROUPS: InterestGroup[] = [
  {
    id: "campus-life",
    label: "Campus life",
    interests: [
      { id: "social", label: "Socials & parties" },
      { id: "intramurals", label: "Intramural sports" },
      { id: "athletics", label: "Rattler athletics" },
      { id: "greek", label: "Greek life" },
      { id: "culture", label: "Cultural events" },
      { id: "faith", label: "Faith & ministry" },
      { id: "service", label: "Service & volunteering" },
      { id: "arts", label: "Arts & music" },
      { id: "gaming", label: "Gaming" },
    ],
  },
  {
    id: "career",
    label: "Career & academics",
    interests: [
      { id: "pre-law", label: "Pre-Law" },
      { id: "pre-med", label: "Pre-Med & health" },
      { id: "business", label: "Business" },
      { id: "engineering", label: "Engineering & tech" },
      { id: "science", label: "Science" },
      { id: "career", label: "Career & networking" },
      { id: "speakers", label: "Talks & speakers" },
    ],
  },
];

export const ALL_INTERESTS: Interest[] = INTEREST_GROUPS.flatMap(
  (group) => group.interests,
);

export function interestLabel(id: string): string {
  return ALL_INTERESTS.find((interest) => interest.id === id)?.label ?? id;
}

/** Which mock interests each synced event would be tagged with. */
export const EVENT_INTERESTS: Record<string, string[]> = {
  "12953880": ["social"],
  "12977327": ["greek", "intramurals", "service"],
  "12890936": ["pre-law", "social"],
  "12917579": ["pre-law", "faith", "social"],
  "12966493": ["social", "business"],
  "12933044": ["pre-law", "culture"],
  "12935246": ["pre-med", "service"],
  "12908276": ["business", "career"],
  "12969667": ["social", "engineering"],
  "12974413": ["speakers", "faith"],
  "12966502": ["service", "social"],
  "12966512": ["service"],
};

export type Role = "student" | "leader" | "admin";

export interface MockUser {
  name: string;
  email: string;
  role: Role;
  /** Selected interest IDs. */
  interests: string[];
  notifications: { email: boolean; push: boolean };
}

export const MOCK_STUDENT: MockUser = {
  name: "Maya Gonzales",
  email: "mgonzales7@mail.stmarytx.edu",
  role: "student",
  interests: ["pre-law", "intramurals", "social", "service"],
  notifications: { email: true, push: false },
};

export const MOCK_LEADER: MockUser = {
  name: "Jordan Reyes",
  email: "jreyes12@mail.stmarytx.edu",
  role: "leader",
  interests: ["service", "business", "career"],
  notifications: { email: true, push: true },
};

export const MOCK_ADMIN: MockUser = {
  name: "Dr. Elena Whitaker",
  email: "ewhitaker@stmarytx.edu",
  role: "admin",
  interests: [],
  notifications: { email: true, push: false },
};

/** The club the mock leader runs. */
export const MOCK_CLUB = { id: "rotaract", name: "Rotaract" };

/** Status of an event the leader created by hand (RE-22, RE-23). */
export type OrganizerEventStatus = "published" | "cancelled" | "past";

export interface OrganizerEvent {
  id: string;
  title: string;
  /** ISO 8601. */
  startsAt: string;
  endsAt: string | null;
  location: string;
  interests: string[];
  status: OrganizerEventStatus;
  /** "manual" was made in RattlerRadar; "rattlertracks" was synced. */
  source: "manual" | "rattlertracks";
  rsvpCount: number | null;
}

export const MOCK_ORGANIZER_EVENTS: OrganizerEvent[] = [
  {
    id: "m-101",
    title: "Coat Drive Kickoff",
    startsAt: "2026-11-20T23:00:00.000Z",
    endsAt: "2026-11-21T01:00:00.000Z",
    location: "University Center, Conference Room A",
    interests: ["service"],
    status: "published",
    source: "manual",
    rsvpCount: 18,
  },
  {
    id: "12966502",
    title: "Dunk-a-Knight",
    startsAt: "2026-11-18T16:00:00.000Z",
    endsAt: "2026-11-18T19:00:00.000Z",
    location: "Barrett Memorial Tower Plaza",
    interests: ["service", "social"],
    status: "published",
    source: "rattlertracks",
    rsvpCount: 42,
  },
  {
    id: "m-102",
    title: "Resume Night with Rotary San Antonio",
    startsAt: "2026-12-03T00:00:00.000Z",
    endsAt: "2026-12-03T01:30:00.000Z",
    location: "Alkek Business Building 103",
    interests: ["career", "business"],
    status: "published",
    source: "manual",
    rsvpCount: 7,
  },
  {
    id: "m-103",
    title: "Food Bank Volunteer Shift",
    startsAt: "2026-11-22T15:00:00.000Z",
    endsAt: "2026-11-22T18:00:00.000Z",
    location: "San Antonio Food Bank",
    interests: ["service"],
    status: "cancelled",
    source: "manual",
    rsvpCount: 11,
  },
  {
    id: "m-099",
    title: "Fall General Meeting",
    startsAt: "2026-10-28T23:00:00.000Z",
    endsAt: "2026-10-29T00:00:00.000Z",
    location: "Reinbolt 101",
    interests: ["service"],
    status: "past",
    source: "manual",
    rsvpCount: 31,
  },
];

/** Why an event is in the admin's review queue (RE-24). */
export interface EventReport {
  eventId: string;
  reason: "inaccurate" | "inappropriate" | "duplicate" | "spam";
  note: string;
  reportedBy: string;
  /** ISO 8601. */
  reportedAt: string;
}

export const REPORT_REASON_LABELS: Record<EventReport["reason"], string> = {
  inaccurate: "Wrong details",
  inappropriate: "Inappropriate",
  duplicate: "Duplicate",
  spam: "Spam",
};

export const MOCK_REPORTS: EventReport[] = [
  {
    eventId: "12890936",
    reason: "inaccurate",
    note: "This moved to Saturday, the flyer still says Friday.",
    reportedBy: "Andre Lopez",
    reportedAt: "2026-11-12T19:42:00.000Z",
  },
  {
    eventId: "12890936",
    reason: "inaccurate",
    note: "Time is wrong.",
    reportedBy: "Priya Nair",
    reportedAt: "2026-11-13T02:10:00.000Z",
  },
  {
    eventId: "12974413",
    reason: "inappropriate",
    note: "Description has language that shouldn't be on a school site.",
    reportedBy: "Sam Ortiz",
    reportedAt: "2026-11-12T22:05:00.000Z",
  },
  {
    eventId: "q-7",
    reason: "spam",
    note: "Selling concert tickets, not an event.",
    reportedBy: "Taylor Kim",
    reportedAt: "2026-11-13T01:30:00.000Z",
  },
];

/** Student-posted quick activities (RE-17). Shown in admin and the student feed. */
export interface QuickActivity {
  id: string;
  title: string;
  /** ISO 8601. */
  startsAt: string;
  location: string;
  postedBy: string;
  joinedCount: number;
}

export const MOCK_QUICK_ACTIVITIES: QuickActivity[] = [
  {
    id: "q-4",
    title: "Pickup soccer, need 4 more",
    startsAt: "2026-11-13T22:30:00.000Z",
    location: "Intramural Field",
    postedBy: "Luis Herrera",
    joinedCount: 6,
  },
  {
    id: "q-5",
    title: "Study group for Bio 1401 final",
    startsAt: "2026-11-14T00:00:00.000Z",
    location: "Blume Library, 2nd floor",
    postedBy: "Ana Torres",
    joinedCount: 3,
  },
  {
    id: "q-7",
    title: "Cheap Bad Bunny tickets DM me",
    startsAt: "2026-11-14T02:00:00.000Z",
    location: "Online",
    postedBy: "unknown_user42",
    joinedCount: 0,
  },
];

/** Recent RattlerTracks sync runs (RE-6), newest first. */
export const MOCK_SYNC_RUNS = [
  { at: "2026-11-13T11:00:00.000Z", ok: true, added: 2, updated: 9, kept: 1 },
  { at: "2026-11-12T11:00:00.000Z", ok: true, added: 4, updated: 8, kept: 1 },
  { at: "2026-11-11T11:00:00.000Z", ok: false, added: 0, updated: 0, kept: 0 },
  { at: "2026-11-10T11:00:00.000Z", ok: true, added: 1, updated: 11, kept: 0 },
];

/** Events an admin already removed; the sync keeps them hidden (RE-24). */
export const MOCK_REMOVED_EVENTS = [
  {
    id: "12801122",
    title: "Members-only Mixer (wrong date)",
    removedAt: "2026-11-09T16:20:00.000Z",
    removedBy: "Dr. Elena Whitaker",
    reason: "Wrong details",
  },
];
