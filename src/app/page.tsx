import { EventFeed } from "@/components/event-feed/event-feed";
import { SiteHeader } from "@/components/site-header";
import { getEventFeed } from "@/lib/events/get-event-feed";

export default async function HomePage() {
  const { events, lastSynced } = await getEventFeed();

  return (
    <EventFeed.Provider events={events}>
      <SiteHeader>
        <EventFeed.Search className="max-w-xs" />
      </SiteHeader>

      <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-24 sm:px-6">
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Upcoming events
            </h1>
            <EventFeed.Count />
            {lastSynced ? (
              <p className="w-full text-sm text-muted-foreground sm:ml-auto sm:w-auto">
                From RattlerTracks, updated {lastSynced}
              </p>
            ) : null}
          </div>
          <EventFeed.Filters />
        </div>

        <EventFeed.Grid />
      </main>
    </EventFeed.Provider>
  );
}
