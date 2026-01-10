import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"; // <--- Import this

export const items = pgTable("items", {
  id: uuid("id")
    .default(sql`uuid_generate_v7()`)
    .primaryKey(),

  title: text("title").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
});