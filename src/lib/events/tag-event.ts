/**
 * Tags events with Jev, TypeSafe AI's decision model: which tags (IDs from
 * `src/lib/interests.ts`) an event is about, who it's for, and whether it
 * has free food or free stuff.
 *
 * Every tag is its own yes/no question, all asked in one request per event.
 * Jev's probabilities are calibrated, so they're stored as each tag's
 * confidence. RattlerTracks' own themes and categories are ignored: Jev
 * sees only what students see (title, hosts, location, description).
 *
 * Needs TYPESAFE_AI_API_KEY. Jev only charges for input (~$0.04 per million
 * tokens), so tagging every event costs a few cents.
 */
import { createHash } from "node:crypto";
import { createTypeSafeAi } from "@ai-sdk/typesafe-ai";
import { experimental_decide as decide } from "ai";
import { env } from "@/lib/env";
import { INTERESTS } from "@/lib/interests";
import { type Audience, FREE_FOOD, FREE_STUFF } from "./tagging";

/**
 * Bump when the questions change (including tag descriptions), so every
 * event gets tagged again on the next sync or `bun run tag:events`.
 */
export const TAGGER_VERSION = 1;

const MODEL_ID = "jev-1.14.0";

/** Tags below this aren't stored at all (shown ones: `SHOWN_TAG_MIN_CONFIDENCE`). */
const STORE_MIN_CONFIDENCE = 0.2;
/** How sure Jev must be before we add a perk RattlerTracks didn't list. */
const PERK_MIN_PROBABILITY = 0.7;

/** Descriptions past this are cut off; plenty for any real event. */
const MAX_DESCRIPTION_CHARS = 6000;

export interface EventTag {
  tagId: string;
  confidence: number;
}

export interface TaggableEvent {
  title: string;
  descriptionHtml: string | null;
  location: string | null;
  hosts: { name: string }[];
}

export interface EventTagging {
  tags: EventTag[];
  audience: Audience;
  /** Perks Jev found in the description, e.g. ["Free Food"]. */
  detectedBenefits: string[];
}

/** Changes when the event's text or the tagger does; unchanged events skip tagging. */
export function taggingHash(event: TaggableEvent): string {
  return createHash("sha256")
    .update(JSON.stringify([TAGGER_VERSION, toState(event)]))
    .digest("base64url");
}

interface BooleanQuestion {
  type: "boolean";
  instructions: string;
  criteria: { true: string; false: string };
}

const TAG_QUESTIONS: Record<`tag_${string}`, BooleanQuestion> =
  Object.fromEntries(
    INTERESTS.map((tag) => [
      `tag_${tag.id}`,
      {
        type: "boolean" as const,
        instructions: `Is this event about "${tag.label}"?`,
        criteria: {
          true: tag.description,
          false:
            "The event isn't substantially about this. A passing mention, or the topic of the host organization alone, doesn't count.",
        },
      },
    ]),
  );

const QUESTIONS = {
  ...TAG_QUESTIONS,
  audience: {
    type: "choice" as const,
    instructions:
      "Who is this event for? St. Mary's University has undergraduates and a School of Law.",
    criteria: {
      everyone:
        "Open to any student who wants to come, including general meetings, recruitment and info sessions, profit shares, and public fundraisers.",
      undergrad:
        "Meant for undergraduates; it wouldn't make sense for law students.",
      law: "Meant for law students (School of Law, J.D. or LL.M.); it wouldn't make sense for most undergraduates.",
      members:
        "Clearly only for the host organization's own members, officers, or invited guests: Greek chapter meetings, council or officer meetings, initiations, inductions, formals, member trainings. Only pick this when the event says so or is obviously internal.",
    } satisfies Record<Audience, string>,
  },
  freeFood: {
    type: "boolean" as const,
    instructions: "Does the event give attendees free food or drinks?",
    criteria: {
      true: "Food or drinks are provided for free: pizza, snacks, breakfast tacos, BBQ, refreshments, coffee.",
      false:
        "No free food or drinks are mentioned, or food is sold (bake sales, fundraisers selling food).",
    },
  },
  freeStuff: {
    type: "boolean" as const,
    instructions:
      "Does the event give attendees free things to take home, other than food?",
    criteria: {
      true: "Free giveaways: t-shirts, swag, merch, supplies, free raffle prizes.",
      false: "No free items are mentioned, or items are sold.",
    },
  },
};

let jev: ReturnType<typeof createTypeSafeAi> | undefined;

export async function tagEvent(event: TaggableEvent): Promise<EventTagging> {
  if (!env.TYPESAFE_AI_API_KEY) {
    throw new Error("TYPESAFE_AI_API_KEY is not set (see .env.example)");
  }
  jev ??= createTypeSafeAi({ apiKey: env.TYPESAFE_AI_API_KEY });

  const { answers } = await decide({
    model: jev.decisionModel(MODEL_ID),
    state: toState(event),
    questions: QUESTIONS,
  });

  // The SDK's answer type keeps only the literal keys; the tag questions are
  // all booleans, so their answers all have a probability.
  const tagAnswers = answers as unknown as Record<
    keyof typeof TAG_QUESTIONS,
    { probability: number }
  >;
  const tags = INTERESTS.map((tag) => ({
    tagId: tag.id,
    confidence: tagAnswers[`tag_${tag.id}`].probability,
  }))
    .filter((tag) => tag.confidence >= STORE_MIN_CONFIDENCE)
    .toSorted((a, b) => b.confidence - a.confidence);

  return {
    tags,
    audience: answers.audience.choice,
    detectedBenefits: [
      ...(answers.freeFood.probability >= PERK_MIN_PROBABILITY
        ? [FREE_FOOD]
        : []),
      ...(answers.freeStuff.probability >= PERK_MIN_PROBABILITY
        ? [FREE_STUFF]
        : []),
    ],
  };
}

/**
 * Tags many events, a few requests at a time. Results are in the same
 * order as `events`. Throws if any event fails (after the SDK's retries).
 */
export async function tagEvents(
  events: TaggableEvent[],
  {
    concurrency = 8,
    onProgress,
  }: {
    concurrency?: number;
    onProgress?: (done: number, total: number) => void;
  } = {},
): Promise<EventTagging[]> {
  const results: EventTagging[] = new Array(events.length);
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < events.length) {
      const index = next++;
      results[index] = await tagEvent(events[index]);
      onProgress?.(++done, events.length);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, events.length) }, worker),
  );
  return results;
}

/** What Jev reads: what a student would see on the event's page. */
function toState(event: TaggableEvent) {
  return {
    title: event.title,
    hostedBy: event.hosts.map((host) => host.name),
    location: event.location,
    description: stripHtml(event.descriptionHtml ?? "").slice(
      0,
      MAX_DESCRIPTION_CHARS,
    ),
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<(br|\/p|\/li)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}
