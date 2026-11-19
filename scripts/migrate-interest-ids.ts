/**
 * One-off: moves students' saved interests to the tag IDs introduced with
 * Jev tagging (e.g. "pre-law" -> "law"). Safe to run more than once.
 *
 * Usage: bun scripts/migrate-interest-ids.ts
 * (Point DATABASE_URL at Turso to migrate production.)
 */
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { isInterestId } from "@/lib/interests";

const RENAMED: Record<string, string> = {
  intramurals: "sports",
  athletics: "sports",
  "pre-law": "law",
  "pre-med": "health",
  engineering: "tech",
  speakers: "talks",
  gaming: "games",
};

async function main() {
  for (const newId of Object.values(RENAMED)) {
    if (!isInterestId(newId)) throw new Error(`Unknown interest ${newId}`);
  }

  const before = await db.all<{ n: number }>(
    sql`select count(*) as n from user_interest`,
  );
  await db.batch(
    [
      // OR IGNORE: someone with both "intramurals" and "athletics" gets one "sports".
      ...Object.entries(RENAMED).map(
        ([oldId, newId]) =>
          sql`insert or ignore into user_interest (user_id, interest_id)
            select user_id, ${newId} from user_interest where interest_id = ${oldId}`,
      ),
      sql`delete from user_interest where interest_id in ${Object.keys(RENAMED)}`,
    ].map((query) => db.run(query)) as [ReturnType<typeof db.run>],
  );

  const leftovers = await db.all<{ interest_id: string; n: number }>(
    sql`select interest_id, count(*) as n from user_interest group by interest_id`,
  );
  const unknown = leftovers.filter((row) => !isInterestId(row.interest_id));
  console.log(
    `Migrated interests (${before[0].n} rows before, ${leftovers.reduce((sum, row) => sum + row.n, 0)} after).`,
  );
  if (unknown.length > 0) {
    console.warn("Unknown interest IDs still saved:", unknown);
  }
}

main().catch((error) => {
  console.error("Migration failed; nothing changed.", error);
  process.exitCode = 1;
});
