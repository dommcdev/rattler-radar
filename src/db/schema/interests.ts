import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/** The interests each student picked (IDs from `src/lib/interests.ts`). */
export const userInterest = sqliteTable(
  "user_interest",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    interestId: text("interest_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.interestId] })],
);
