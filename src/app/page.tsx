import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EventFeed } from "@/components/event-feed/event-feed";
import { EVENT_GRID_CLASS } from "@/components/event-feed/event-feed-grid";
import { ForYouFeed } from "@/components/event-feed/for-you-feed";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventFeed } from "@/lib/events/get-event-feed";
import { getPersonalFeed } from "@/lib/events/personal-feed";
import { getSession } from "@/lib/session";

/**
 * The personal feed: "Events you might like" and "More events for you"
 * (see plan.md). Visitors we can't personalize for (not signed in, or no
 * interests or history yet) go to /events instead; `src/proxy.ts` sends
 * visitors without a session there before this page even renders.
 *
 * The event list is cached and shared, so the header and search render
 * right away; only the personal part waits for the session.
 */
export default async function HomePage() {
  const { events, lastSynced } = await getEventFeed();

  return (
    <EventFeed.Provider events={events}>
      <SiteHeader>
        <EventFeed.Search className="max-w-xs" />
      </SiteHeader>

      <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-24 sm:px-6">
        <Suspense fallback={<FeedSkeleton />}>
          <HomeFeed lastSynced={lastSynced} />
        </Suspense>
      </main>
    </EventFeed.Provider>
  );
}

async function HomeFeed({ lastSynced }: { lastSynced: string | null }) {
  const session = await getSession();
  if (!session) redirect("/events");

  const feed = await getPersonalFeed(session.user.id);
  if (feed.kind === "empty") redirect("/events");

  return <ForYouFeed feed={feed} lastSynced={lastSynced} />;
}

function FeedSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="mb-8 h-7 w-56" />
      <div className={EVENT_GRID_CLASS}>
        {Array.from({ length: 4 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          <div key={index}>
            <Skeleton className="aspect-[5/3] w-full" />
            <Skeleton className="mt-3.5 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
