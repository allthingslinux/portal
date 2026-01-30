import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const ircAccountStatusEnum = pgEnum("irc_account_status", [
  "active",
  "suspended",
  "deleted",
]);

export const ircAccount = pgTable(
  "irc_account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    nick: text("nick").notNull().unique(),
    server: text("server").notNull(),
    port: integer("port").default(6697).notNull(),
    status: ircAccountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [index("irc_account_status_idx").on(table.status)]
);
