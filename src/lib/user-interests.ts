import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userInterest } from "@/db/schema";

/** The interest IDs a student has picked. */
export async function getUserInterests(userId: string): Promise<string[]> {
  const rows = await db
    .select({ interestId: userInterest.interestId })
    .from(userInterest)
    .where(eq(userInterest.userId, userId));
  return rows.map((row) => row.interestId);
}

/** Replaces a student's interests with `interestIds`. */
export async function setUserInterests(
  userId: string,
  interestIds: string[],
): Promise<void> {
  await db.batch([
    db.delete(userInterest).where(eq(userInterest.userId, userId)),
    ...interestIds.map((interestId) =>
      db.insert(userInterest).values({ userId, interestId }),
    ),
  ]);
}
