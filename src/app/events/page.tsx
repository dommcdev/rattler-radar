import type { Metadata } from "next";
import { AllEvents } from "@/components/event-feed/all-events";
import { EventFeed } from "@/components/event-feed/event-feed";
import { SiteHeader } from "@/components/site-header";
import { getEventFeed } from "@/lib/events/get-event-feed";

export const metadata: Metadata = { title: "All events · RattlerRadar" };

export default async function AllEventsPage() {
  const { events, lastSynced } = await getEventFeed();

  return (
    <EventFeed.Provider events={events}>
      <SiteHeader>
        <EventFeed.Search className="max-w-xs" />
      </SiteHeader>
      <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-24 sm:px-6">
        <AllEvents lastSynced={lastSynced} />
      </main>
    </EventFeed.Provider>
  );
}
