/**
 * How much a student would want each upcoming event (see plan.md, "Score").
 *
 * affinity = interest match + what they've done before. It doesn't depend
 * on when the event is, and decides whether an event is "for you" at all.
 *
 * score = affinity, weighted down the further away the event is. It decides
 * what makes "Events you might like": a series someone keeps going to still
 * makes it months out, while an event that only matches their interests has
 * to be close.
 *
 * The weights are hand-tuned guesses, kept here so they're easy to adjust.
 */

import type { Audience } from "./tagging";

const DAY_MS = 86_400_000;

export const WEIGHTS = {
  /** Sum of matched tag confidences, capped (so several matches beat one). */
  interestCap: 1.5,
  /** Per past event in the same series they RSVP'd to. */
  seriesRsvp: 0.8,
  seriesCap: 4,
  /** Per past event from the same host they RSVP'd to. */
  hostRsvp: 0.3,
  hostRsvpCap: 1,
  /** Per other event from the same host whose page they opened. */
  hostView: 0.1,
  hostViewCap: 0.3,
  /** They opened this event's page / clicked to RSVP to it. */
  viewedThis: 0.4,
  rsvpedThis: 0.8,
  /**
   * Interest matches count this much for events most students can't go to
   * or wouldn't fit in: members-only events, and law school events for
   * students who didn't pick "law". History with the series or host still
   * counts in full, so members keep seeing their own club's events.
   */
  narrowAudience: 0.3,
  /** Days until the score halves (1 / (1 + days / this)). */
  distanceDays: 30,
};

/** An event needs at least this score to be in "Events you might like". */
export const MIGHT_LIKE_MIN_SCORE = 1.2;
/** At most this many "might like" cards (two rows on the widest screens). */
export const MIGHT_LIKE_MAX = 6;
/** An event needs at least this affinity to be "for you". */
export const FOR_YOU_MIN_AFFINITY = 0.5;

export interface ScorableEvent {
  id: string;
  startsAt: number;
  seriesKey: string;
  hostIds: string[];
  tags: { tagId: string; confidence: number }[];
  audience: Audience | null;
}

export interface Interaction {
  eventId: string;
  type: "view" | "rsvp_click";
  eventStartsAt: number;
  seriesKey: string;
  hostIds: string[];
}

/** The main reason an event scored well, for the line on its card. */
export type ScoreReason =
  | { kind: "series"; count: number }
  | { kind: "host"; hostId: string; via: "rsvp" | "view" }
  | { kind: "rsvped" }
  | { kind: "viewed" }
  | { kind: "interests"; tagIds: string[] }
  | { kind: "none" };

export interface EventScore {
  eventId: string;
  affinity: number;
  score: number;
  reason: ScoreReason;
}

export function scoreEvents(
  events: ScorableEvent[],
  user: { interests: string[]; interactions: Interaction[] },
  now: number,
): EventScore[] {
  const interests = new Set(user.interests);
  // Past events they clicked to RSVP to: our stand-in for "went".
  const pastRsvps = dedupe(
    user.interactions.filter(
      (i) => i.type === "rsvp_click" && i.eventStartsAt < now,
    ),
  );
  const views = dedupe(user.interactions.filter((i) => i.type === "view"));

  return events.map((event) => {
    const matched = event.tags
      .filter((tag) => interests.has(tag.tagId))
      .toSorted((a, b) => b.confidence - a.confidence);
    const narrow =
      event.audience === "members" ||
      (event.audience === "law" && !interests.has("law"));
    const interest =
      Math.min(
        WEIGHTS.interestCap,
        matched.reduce((sum, tag) => sum + tag.confidence, 0),
      ) * (narrow ? WEIGHTS.narrowAudience : 1);

    const seriesCount = pastRsvps.filter(
      (i) => i.seriesKey === event.seriesKey && i.eventId !== event.id,
    ).length;
    const series = Math.min(
      WEIGHTS.seriesCap,
      seriesCount * WEIGHTS.seriesRsvp,
    );

    const sharesHost = (i: Interaction) =>
      i.eventId !== event.id &&
      i.hostIds.some((id) => event.hostIds.includes(id));
    const hostRsvps = pastRsvps.filter(sharesHost);
    const hostViews = views.filter(sharesHost);
    const host =
      Math.min(WEIGHTS.hostRsvpCap, hostRsvps.length * WEIGHTS.hostRsvp) +
      Math.min(WEIGHTS.hostViewCap, hostViews.length * WEIGHTS.hostView);
    const hostSource = hostRsvps.length > 0 ? hostRsvps : hostViews;

    const rsvpedThis = user.interactions.some(
      (i) => i.eventId === event.id && i.type === "rsvp_click",
    );
    const viewedThis = views.some((i) => i.eventId === event.id);
    const self = rsvpedThis
      ? WEIGHTS.rsvpedThis
      : viewedThis
        ? WEIGHTS.viewedThis
        : 0;

    const affinity = interest + series + host + self;
    const days = Math.max(0, (event.startsAt - now) / DAY_MS);
    const score = affinity / (1 + days / WEIGHTS.distanceDays);

    // The biggest contributor explains the card.
    const reasons: [number, ScoreReason][] = [
      [series, { kind: "series", count: seriesCount }],
      [
        host,
        {
          kind: "host",
          hostId:
            event.hostIds.find((id) =>
              hostSource.some((i) => i.hostIds.includes(id)),
            ) ?? "",
          via: hostRsvps.length > 0 ? "rsvp" : "view",
        },
      ],
      [self, rsvpedThis ? { kind: "rsvped" } : { kind: "viewed" }],
      [
        interest,
        { kind: "interests", tagIds: matched.map((tag) => tag.tagId) },
      ],
    ];
    const [best, reason] = reasons.reduce((a, b) => (b[0] > a[0] ? b : a));

    return {
      eventId: event.id,
      affinity,
      score,
      reason: best > 0 ? reason : { kind: "none" },
    };
  });
}

/** Splits scored events into the home page's two sections. */
export function pickSections(scores: EventScore[]) {
  const mightLike = scores
    .filter((s) => s.score >= MIGHT_LIKE_MIN_SCORE)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, MIGHT_LIKE_MAX);
  const forYou = scores.filter((s) => s.affinity >= FOR_YOU_MIN_AFFINITY);
  return { mightLike, forYou };
}

/** One entry per event, so opening a page five times counts once. */
function dedupe(interactions: Interaction[]): Interaction[] {
  return [...new Map(interactions.map((i) => [i.eventId, i])).values()];
}
