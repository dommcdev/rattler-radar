import { VARIANTS as admin } from "../admin/_variants";
import { VARIANTS as createEvent } from "../create-event/_variants";
import { VARIANTS as forYou } from "../for-you/_variants";
import { VARIANTS as myEvents } from "../my-events/_variants";
import { VARIANTS as onboarding } from "../onboarding/_variants";
import { VARIANTS as settings } from "../settings/_variants";

export interface MockupSection {
  id: string;
  title: string;
  who: string;
  summary: string;
  stories: string[];
  variants: { a: string; b: string; c: string };
}

/** Every unbuilt part of the app, in the order a new user meets them. */
export const MOCKUP_SECTIONS: MockupSection[] = [
  {
    id: "onboarding",
    title: "Onboarding",
    who: "New students",
    summary: "Pick interests after first sign-in so the feed starts personal.",
    stories: ["RE-13", "RE-21"],
    variants: onboarding,
  },
  {
    id: "for-you",
    title: "For you",
    who: "Students",
    summary:
      "The signed-in home: events matching your interests, plus quick activities.",
    stories: ["RE-13", "RE-17"],
    variants: forYou,
  },
  {
    id: "settings",
    title: "Interests and notifications",
    who: "Students",
    summary: "Change interests and turn email or push notifications on or off.",
    stories: ["RE-13", "RE-21", "RE-19"],
    variants: settings,
  },
  {
    id: "my-events",
    title: "My events",
    who: "Club leaders",
    summary: "See, edit, and cancel the events your club has published.",
    stories: ["RE-22"],
    variants: myEvents,
  },
  {
    id: "create-event",
    title: "Create an event",
    who: "Club leaders and students",
    summary:
      "Publish an official club event, or post a quick activity from your phone.",
    stories: ["RE-23", "RE-17"],
    variants: createEvent,
  },
  {
    id: "admin",
    title: "Admin dashboard",
    who: "Administrators",
    summary:
      "Review reported listings, remove them for good, and check the daily sync.",
    stories: ["RE-24", "RE-20", "RE-6"],
    variants: admin,
  },
];
