import { UsersIcon } from "lucide-react";
import { EventCard } from "@/components/event-feed/event-card";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_QUICK_ACTIVITIES, MOCK_STUDENT } from "../../_lib/data";
import { getMockEvents } from "../../_lib/get-mock-events";
import { formatTime } from "../_components/draft";
import { QuickSheet } from "../_components/quick-sheet";

/**
 * Variant C: a phone-first sheet over the student's For you page. The page
 * behind is a stand-in so the sheet has context; the "Post activity"
 * button reopens it.
 */
export default async function CreateEventC() {
  const { events } = await getMockEvents();
  const mine = events
    .filter((event) =>
      event.interests.some((id) => MOCK_STUDENT.interests.includes(id)),
    )
    .slice(0, 6);
  const activities = MOCK_QUICK_ACTIVITIES.filter((item) => item.id !== "q-7");

  return (
    <>
      <MockHeader
        user={MOCK_STUDENT}
        nav={NAV_BY_ROLE.student}
        active="For you"
      />
      <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-28 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">For you</h1>
          <QuickSheet />
        </div>

        <section className="mt-8">
          <h2 className="font-semibold tracking-tight">Happening today</h2>
          <ul className="mt-3 divide-y border-y sm:max-w-xl">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center gap-4 py-3">
                <span className="w-16 shrink-0 text-sm font-medium tabular-nums">
                  {formatTime(new Date(activity.startsAt))}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">
                    {activity.title}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {activity.location}, posted by {activity.postedBy}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground tabular-nums">
                  <UsersIcon className="size-3.5" />
                  {activity.joinedCount}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-semibold tracking-tight">
            Matches your interests
          </h2>
          <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {mine.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </main>
      <VariantSwitcher section="create-event" variant="c" />
    </>
  );
}
