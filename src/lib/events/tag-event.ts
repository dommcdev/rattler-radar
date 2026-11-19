/**
 * Decides which interests (IDs from `src/lib/interests.ts`) an event is
 * about, and how sure we are (0 to 1).
 *
 * STAND-IN: these are keyword and category rules. The plan is to replace
 * the body of `tagEvent` with a call to an AI model; it's async and returns
 * the same shape so the sync script and scoring don't change when we do.
 */

export interface EventTag {
  tagId: string;
  confidence: number;
}

export interface TaggableEvent {
  title: string;
  descriptionHtml: string | null;
  hosts: { name: string }[];
  theme: string | null;
  categories: string[];
}

/** RattlerTracks themes and categories that say outright what an event is. */
const CATEGORY_TAGS: Record<string, [tagId: string, confidence: number][]> = {
  "theme:Athletics": [["athletics", 0.6]],
  "theme:Social": [["social", 0.6]],
  "theme:Cultural": [["culture", 0.8]],
  "theme:Spirituality": [["faith", 0.8]],
  "theme:CommunityService": [["service", 0.8]],
  "theme:ThoughtfulLearning": [["speakers", 0.4]],
  "Social Event": [["social", 0.7]],
  "Faith-Based": [["faith", 0.8]],
  "Service/Philanthropic Event": [["service", 0.8]],
  "Philanthropic Fundraiser": [["service", 0.5]],
  "Brotherhood/Sisterhood": [["greek", 0.7]],
};

/** Words in the title or host name (full confidence) or description (lower). */
const KEYWORD_TAGS: [tagId: string, pattern: RegExp, confidence: number][] = [
  [
    "social",
    /\b(party|parties|social|mixer|mingle|hangout|trivia|bingo|movie night|game night)\b/i,
    0.7,
  ],
  [
    "intramurals",
    /\b(intramurals?|rec sports|pickleball|flag football|kickball|dodgeball)\b/i,
    0.9,
  ],
  [
    "athletics",
    /\b(rattlers? (vs\.?|basketball|soccer|volleyball|baseball|softball|golf|tennis)|game day|home game|tailgate)\b/i,
    0.9,
  ],
  [
    "greek",
    /\b(fraternity|sorority|panhellenic|greek life|alpha|beta|gamma|delta|epsilon|zeta|theta|kappa|lambda|sigma|upsilon|omega)\b/i,
    0.7,
  ],
  [
    "culture",
    /\b(cultur(e|al)|heritage|international|diwali|hispanic|latin[oax]?|black history|lunar new year|asian|dia de los muertos)\b/i,
    0.7,
  ],
  [
    "faith",
    /\b(mass|ministry|prayer|bible|worship|faith|retreat|rosary|catholic|adoration|marianist)\b/i,
    0.8,
  ],
  [
    "service",
    /\b(volunteer(ing)?|service|donat(e|ion)s?|philanthrop(y|ic)|food bank|drive)\b/i,
    0.7,
  ],
  [
    "arts",
    /\b(art|arts|music|concert|choir|band|theat(er|re)|dance|film|poetry|gallery|open mic)\b/i,
    0.8,
  ],
  [
    "gaming",
    /\b(gaming|video games?|esports|smash bros|board games?|mario kart)\b/i,
    0.8,
  ],
  [
    "pre-law",
    /\b(pre-?law|law school|mock trial|moot court|lsat|gavels?)\b/i,
    0.9,
  ],
  [
    "pre-med",
    /\b(pre-?med(ical)?|pre-?health|medical|mcat|nursing|dental|pharmacy|health)\b/i,
    0.9,
  ],
  [
    "business",
    /\b(business|finance|accounting|marketing|entrepreneur(ship)?|economics|investing|case competition)\b/i,
    0.8,
  ],
  [
    "engineering",
    /\b(engineering|coding|hackathon|computer|cyber(security)?|robotics|software|ieee|acm)\b/i,
    0.8,
  ],
  [
    "science",
    /\b(science|biology|chemistry|physics|research|stem|math)\b/i,
    0.6,
  ],
  [
    "career",
    /\b(career|resume|internships?|networking|job fair|interviews?|professional development)\b/i,
    0.8,
  ],
  ["speakers", /\b(speaker|lecture|panel|keynote|guest speaker|talk)\b/i, 0.7],
];

/** A match only in the description counts for less than one in the title. */
const DESCRIPTION_WEIGHT = 0.6;

export async function tagEvent(event: TaggableEvent): Promise<EventTag[]> {
  const tags = new Map<string, number>();
  const add = (tagId: string, confidence: number) =>
    tags.set(tagId, Math.max(tags.get(tagId) ?? 0, confidence));

  const categoryKeys = [
    ...(event.theme ? [`theme:${event.theme}`] : []),
    ...event.categories,
  ];
  for (const key of categoryKeys) {
    for (const [tagId, confidence] of CATEGORY_TAGS[key] ?? []) {
      add(tagId, confidence);
    }
  }

  const headline = [event.title, ...event.hosts.map((host) => host.name)].join(
    " ",
  );
  const description = stripHtml(event.descriptionHtml ?? "");
  for (const [tagId, pattern, confidence] of KEYWORD_TAGS) {
    if (pattern.test(headline)) add(tagId, confidence);
    else if (pattern.test(description)) {
      add(tagId, confidence * DESCRIPTION_WEIGHT);
    }
  }

  return [...tags].map(([tagId, confidence]) => ({ tagId, confidence }));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");
}
