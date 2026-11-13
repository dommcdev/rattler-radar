import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { EventDetailsCard } from "@/components/event-page/event-details-card";
import { EventHosts } from "@/components/event-page/event-hosts";
import { SiteHeader } from "@/components/site-header";
import { getEvent, getEventFeed } from "@/lib/events/get-event-feed";

export async function generateStaticParams() {
  const { events } = await getEventFeed();
  // Cache Components needs at least one param; the placeholder 404s.
  if (events.length === 0) return [{ id: "none" }];
  return events.map((event) => ({ id: event.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/events/[id]">): Promise<Metadata> {
  const event = await getEvent((await params).id);
  return event ? { title: `${event.title} · RattlerEvents` } : {};
}

/**
 * Two columns on wide screens: the event's story on the left, and a sticky
 * card with when, where, and RSVP on the right. On phones the card sits
 * between the flyer and the description, so the essentials come first.
 */
export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const event = await getEvent((await params).id);
  if (!event) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] px-4 pt-5 pb-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          All events
        </Link>

        <div className="mt-4 grid gap-x-10 gap-y-6 lg:grid-cols-[1fr_340px] lg:grid-rows-[auto_1fr] lg:gap-y-8">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {event.title}
            </h1>
            <EventHosts hosts={event.hosts} />

            {event.imageUrl ? (
              <EventFlyer
                src={event.imageUrl}
                sizes="(min-width: 1100px) 700px, (min-width: 1024px) 60vw, 100vw"
                loading="eager"
                className="mt-5 aspect-[5/3] rounded-lg ring-1 ring-border"
              />
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <EventDetailsCard event={event} />
          </aside>

          <div className="min-w-0 lg:col-start-1">
            {event.descriptionHtml ? (
              <section>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                  About this event
                </h2>
                <div
                  className="space-y-3 text-[15px] leading-relaxed text-foreground/85 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:text-foreground [&_ul]:list-disc"
                  // Sanitized on the server in get-event-feed.ts.
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized HTML
                  dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
                />
              </section>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
