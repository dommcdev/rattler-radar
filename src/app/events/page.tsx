import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AllEvents } from "@/components/event-feed/all-events";
import { EventFeed } from "@/components/event-feed/event-feed";
import { SiteHeader } from "@/components/site-header";
import { getEventFeed } from "@/lib/events/get-event-feed";
import { canPersonalize } from "@/lib/events/personal-feed";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "All events · RattlerRadar" };

/** Every upcoming event, for everyone. */
export default async function AllEventsPage() {
  const { events, lastSynced } = await getEventFeed();

  return (
    <EventFeed.Provider events={events}>
      <SiteHeader>
        <EventFeed.Search className="max-w-xs" />
      </SiteHeader>
      <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-24 sm:px-6">
        <AllEvents
          lastSynced={lastSynced}
          notice={
            // Reads the session; the list itself doesn't wait for it.
            <Suspense fallback={null}>
              <PersonalizeNotice />
            </Suspense>
          }
        />
      </main>
    </EventFeed.Provider>
  );
}

const NOTICE = "mb-6 text-[15px] text-muted-foreground";
const NOTICE_LINK = "font-medium text-foreground underline underline-offset-4";

/** Invites visitors to set up the personal feed, if they haven't yet. */
async function PersonalizeNotice() {
  const session = await getSession();
  if (!session) {
    return (
      <p className={NOTICE}>
        <Link href="/sign-in" className={NOTICE_LINK}>
          Sign in
        </Link>{" "}
        for a personalized event feed
      </p>
    );
  }
  if (await canPersonalize(session.user.id)) return null;
  return (
    <p className={NOTICE}>
      <Link href="/onboarding?returnTo=/" className={NOTICE_LINK}>
        Pick a few interests
      </Link>{" "}
      for a personalized event feed
    </p>
  );
}
