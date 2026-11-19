/**
 * The app's one list of event tags. The same IDs are what students pick as
 * interests (onboarding, settings), what Jev tags events with
 * (`src/lib/events/tag-event.ts`), and what the filter pills and search use.
 *
 * IDs are stored in the database (`user_interest`, `event_tag`), so don't
 * rename them without a migration. Changing a `description` changes what Jev
 * tags: bump `TAGGER_VERSION` in `tag-event.ts` so events get tagged again.
 */

export interface Interest {
  id: string;
  label: string;
  /** What counts as this tag. Jev reads it; keep it concrete. */
  description: string;
}

export interface InterestGroup {
  id: string;
  label: string;
  interests: Interest[];
}

export const INTEREST_GROUPS: InterestGroup[] = [
  {
    id: "campus-life",
    label: "Campus life",
    interests: [
      {
        id: "social",
        label: "Socials & hangouts",
        description:
          "Mainly for hanging out and having fun with other people: parties, mixers, trivia, game or movie nights, socials, tailgates, brunches, meet-and-greets.",
      },
      {
        id: "sports",
        label: "Sports & fitness",
        description:
          "Playing or watching sports, or working out: intramurals, pickup games, tournaments, Rattler athletics games, golf, disc golf, yoga, runs.",
      },
      {
        id: "greek",
        label: "Greek life",
        description:
          "Run by or about a fraternity or sorority, or Greek councils: recruitment, rush, chapter events, philanthropy events by Greek organizations.",
      },
      {
        id: "culture",
        label: "Culture & identity",
        description:
          "Celebrates or centers a culture, heritage, nationality, or identity group: cultural student unions, heritage months, cultural holidays and food. Not general holiday parties like Christmas or Halloween socials.",
      },
      {
        id: "faith",
        label: "Faith & ministry",
        description:
          "Religious or spiritual: Mass, prayer, rosary, Bible study, worship, retreats, ministry, Catholic or other faith organizations.",
      },
      {
        id: "service",
        label: "Volunteering & service",
        description:
          "Helping others or the community: volunteering, donation or food drives, service projects, philanthropy, fundraising for a charity or cause. Not fundraisers that raise money for the club itself.",
      },
      {
        id: "arts",
        label: "Arts, music & performance",
        description:
          "Making or enjoying art: music, concerts, choir, band, theater, dance, film, poetry, open mics, crafts, galleries, design contests.",
      },
      {
        id: "games",
        label: "Gaming",
        description:
          "Video games, esports, board games, card games, tabletop games, or game tournaments.",
      },
      {
        id: "advocacy",
        label: "Politics & advocacy",
        description:
          "Politics, civic life, or a cause: voter registration, debates about policy or rights, activism, awareness campaigns, political or advocacy groups.",
      },
      {
        id: "outdoors",
        label: "Outdoors & environment",
        description:
          "Outdoor activities or the environment: hiking, camping, nature trips, gardening, sustainability, conservation, environmental clubs.",
      },
    ],
  },
  {
    id: "career",
    label: "Career & academics",
    interests: [
      {
        id: "law",
        label: "Law",
        description:
          "Law or legal careers, for law students or pre-law undergrads: bar associations, legal societies, mock trial, moot court, lawyers and judges, law school.",
      },
      {
        id: "health",
        label: "Health careers",
        description:
          "Medicine and health professions: pre-med, pre-PA, physical or occupational therapy, nursing, dental, pharmacy, public health, psychology careers.",
      },
      {
        id: "business",
        label: "Business & finance",
        description:
          "Business, finance, accounting, marketing, insurance, economics, entrepreneurship, investing, case competitions.",
      },
      {
        id: "tech",
        label: "Engineering & tech",
        description:
          "Engineering, computer science, coding, cybersecurity, robotics, hackathons, engineering societies.",
      },
      {
        id: "science",
        label: "Science & math",
        description:
          "Natural sciences and math: biology, chemistry, physics, forensic science, math, research, science clubs.",
      },
      {
        id: "career",
        label: "Career & networking",
        description:
          "Building a career: networking, resume help, internships, job fairs, interviews, headshots, site visits, professional development, alumni connections.",
      },
      {
        id: "talks",
        label: "Talks & panels",
        description:
          "Someone presents to an audience: guest speakers, lectures, panels, Q&As, keynotes, presentations, info sessions.",
      },
      {
        id: "competitions",
        label: "Competitions",
        description:
          "Teams or people compete for a win or prize: tournaments, case competitions, contests, hackathons, mock trial competitions.",
      },
    ],
  },
];

export const INTERESTS: Interest[] = INTEREST_GROUPS.flatMap(
  (group) => group.interests,
);

const INTEREST_IDS = new Set(INTERESTS.map(({ id }) => id));

export function isInterestId(id: string): boolean {
  return INTEREST_IDS.has(id);
}

const INTEREST_LABELS = new Map(INTERESTS.map(({ id, label }) => [id, label]));

/** "Law" for "law"; the ID itself if it's unknown. */
export function interestLabel(id: string): string {
  return INTEREST_LABELS.get(id) ?? id;
}
