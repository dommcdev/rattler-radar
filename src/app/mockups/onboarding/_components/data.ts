import { interestLabel, MOCK_STUDENT, type MockUser } from "../../_lib/data";

/** Maya right after her first Google sign-in: nothing picked yet. */
export const NEW_STUDENT: MockUser = {
  ...MOCK_STUDENT,
  interests: [],
  notifications: { email: false, push: false },
};

/** The bits of a mock event the onboarding screens need. */
export interface OnboardingEvent {
  id: string;
  title: string;
  startsAt: string;
  start: { month: string; day: string; time: string };
  location: string | null;
  imageUrl: string | null;
  hosts: { id: string; name: string }[];
  hasFreeFood: boolean;
  interests: string[];
}

/** Events with at least one of the selected tags (RE-13). */
export function matchingEvents<T extends { interests: string[] }>(
  events: T[],
  selected: string[],
): T[] {
  return events.filter((event) =>
    event.interests.some((id) => selected.includes(id)),
  );
}

/** "Pre-Law, Intramural sports and Service & volunteering" */
export function listLabels(ids: string[]): string {
  const labels = ids.map(interestLabel);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

export function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** Mockup-only: trims a server event down to what the client needs. */
export function toOnboardingEvent(event: OnboardingEvent): OnboardingEvent {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    start: event.start,
    location: event.location,
    imageUrl: event.imageUrl,
    hosts: event.hosts,
    hasFreeFood: event.hasFreeFood,
    interests: event.interests,
  };
}
