/**
 * Interest tags students pick during onboarding (RE-13) and later in their
 * account settings. IDs are stored in the database, so don't rename them.
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

const INTEREST_IDS = new Set(
  INTEREST_GROUPS.flatMap((group) => group.interests.map(({ id }) => id)),
);

export function isInterestId(id: string): boolean {
  return INTEREST_IDS.has(id);
}

const INTEREST_LABELS = new Map(
  INTEREST_GROUPS.flatMap((group) =>
    group.interests.map(({ id, label }) => [id, label]),
  ),
);

/** "Pre-Law" for "pre-law"; the ID itself if it's unknown. */
export function interestLabel(id: string): string {
  return INTEREST_LABELS.get(id) ?? id;
}
