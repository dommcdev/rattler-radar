import type { Metadata } from "next";
import Link from "next/link";
import { MockHeader } from "./_components/mock-header";
import { MOCKUP_SECTIONS } from "./_lib/sections";

export const metadata: Metadata = { title: "Mockups · RattlerRadar" };

/** Index of every mockup, grouped by the part of the app it covers. */
export default function MockupsPage() {
  return (
    <>
      <MockHeader wide={false} />
      <main className="mx-auto w-full max-w-[1100px] px-4 pt-10 pb-24 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mockups</h1>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Three directions for each part of RattlerRadar that isn't built yet.
          They use fake users and the real synced events. Nothing saves.
        </p>

        <ol className="mt-8 divide-y border-y">
          {MOCKUP_SECTIONS.map((section, index) => (
            <li
              key={section.id}
              className="grid gap-x-8 gap-y-3 py-6 md:grid-cols-[2rem_1fr_1.4fr]"
            >
              <span className="text-sm text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <div>
                <h2 className="font-semibold tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {section.who}. {section.summary}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {section.stories.join(", ")}
                </p>
              </div>
              <ul className="space-y-1.5">
                {(["a", "b", "c"] as const).map((id) => (
                  <li key={id}>
                    <Link
                      href={`/mockups/${section.id}/${id}`}
                      className="group flex gap-3 rounded-md text-sm"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold uppercase group-hover:border-foreground/40">
                        {id}
                      </span>
                      <span className="pt-0.5 text-muted-foreground group-hover:text-foreground">
                        {section.variants[id]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
