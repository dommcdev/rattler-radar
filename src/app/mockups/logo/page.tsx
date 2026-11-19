import type { Metadata } from "next";
import { MockHeader } from "../_components/mock-header";
import { MARKS, type MarkProps } from "./_marks";

export const metadata: Metadata = { title: "Logo · Mockups · RattlerRadar" };

/** St. Mary's official colors (PMS 301 C blue, PMS 143 C gold). */
const BLUE = "#0D4D84";
const GOLD = "#EFBA31";
const BLACK = "#0a0a0a";
const WHITE = "#fafafa";

interface Colors {
  bg: string;
  main: string;
  accent: string;
  /** "Rattler" */
  word: string;
  /** "Radar" */
  word2: string;
  /** Draw the mark on a rounded tile of this color, like an app icon. */
  tile?: string;
}

interface Scheme {
  id: string;
  name: string;
  light: Colors;
  dark: Colors;
}

const SCHEMES: Scheme[] = [
  {
    id: "blue-gold",
    name: "Blue + gold",
    light: { bg: WHITE, main: BLUE, accent: GOLD, word: BLACK, word2: BLUE },
    // Official blue is too dark to read on black, so dark mode leads with gold.
    dark: { bg: BLACK, main: GOLD, accent: WHITE, word: WHITE, word2: GOLD },
  },
  {
    id: "black-gold",
    name: "Black + gold",
    light: { bg: WHITE, main: BLACK, accent: GOLD, word: BLACK, word2: BLACK },
    dark: { bg: BLACK, main: WHITE, accent: GOLD, word: WHITE, word2: GOLD },
  },
  {
    id: "gold-tile",
    name: "Gold on blue tile",
    light: {
      bg: WHITE,
      main: GOLD,
      accent: WHITE,
      word: BLACK,
      word2: BLUE,
      tile: BLUE,
    },
    dark: {
      bg: BLACK,
      main: GOLD,
      accent: WHITE,
      word: WHITE,
      word2: GOLD,
      tile: BLUE,
    },
  },
  {
    id: "blue-tile",
    name: "Blue on gold tile",
    light: {
      bg: WHITE,
      main: BLUE,
      accent: WHITE,
      word: BLACK,
      word2: BLUE,
      tile: GOLD,
    },
    dark: {
      bg: BLACK,
      main: BLUE,
      accent: WHITE,
      word: WHITE,
      word2: GOLD,
      tile: GOLD,
    },
  },
];

type MarkComponent = (props: MarkProps) => React.ReactNode;

function MarkIn({
  Mark,
  colors,
  size,
}: {
  Mark: MarkComponent;
  colors: Colors;
  size: number;
}) {
  if (!colors.tile) {
    return (
      <Mark
        main={colors.main}
        accent={colors.accent}
        className="shrink-0"
        size={size}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        background: colors.tile,
        borderRadius: size * 0.24,
      }}
    >
      <Mark main={colors.main} accent={colors.accent} className="size-[72%]" />
    </span>
  );
}

function Lockup({ Mark, colors }: { Mark: MarkComponent; colors: Colors }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <MarkIn Mark={Mark} colors={colors} size={30} />
      <span className="text-xl font-bold tracking-tight">
        <span style={{ color: colors.word }}>Rattler</span>
        <span style={{ color: colors.word2 }}>Radar</span>
      </span>
    </span>
  );
}

function Panel({ Mark, colors }: { Mark: MarkComponent; colors: Colors }) {
  return (
    <div
      className="flex flex-col items-center gap-5 px-4 py-6"
      style={{ background: colors.bg }}
    >
      <MarkIn Mark={Mark} colors={colors} size={72} />
      <Lockup Mark={Mark} colors={colors} />
      <span className="flex items-center gap-3">
        <MarkIn Mark={Mark} colors={colors} size={32} />
        <MarkIn Mark={Mark} colors={colors} size={20} />
        <MarkIn Mark={Mark} colors={colors} size={16} />
      </span>
    </div>
  );
}

/** Every candidate mark in every color scheme, on light and dark. */
export default function LogoMockupPage() {
  return (
    <>
      <MockHeader wide={false} />
      <main className="mx-auto w-full max-w-[1400px] px-4 pt-10 pb-24 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Logo</h1>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Five rattle/radar marks, each in four St. Mary&apos;s color schemes
          (blue {BLUE}, gold {GOLD}, black). Each card shows light on top and
          dark below, with the header lockup and small sizes down to a 16px
          favicon.
        </p>

        <div className="mt-10 space-y-14">
          {MARKS.map(({ id, name, note, Mark }, index) => (
            <section key={id}>
              <h2 className="font-semibold tracking-tight">
                {index + 1}. {name}
                <span className="ml-2 font-normal text-muted-foreground">
                  {note}
                </span>
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {SCHEMES.map((scheme, schemeIndex) => (
                  <figure
                    key={scheme.id}
                    className="overflow-hidden rounded-lg border"
                  >
                    <Panel Mark={Mark} colors={scheme.light} />
                    <Panel Mark={Mark} colors={scheme.dark} />
                    <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">
                      {index + 1}
                      {String.fromCharCode(97 + schemeIndex)} · {scheme.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
