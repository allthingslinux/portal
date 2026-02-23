import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";

import { user } from "./auth";

export const mailcowAccountStatusEnum = pgEnum("mailcow_account_status", [
  "active",
  "suspended",
  "deleted",
]);

export const mailcowAccount = pgTable(
  "mailcow_account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    domain: text("domain").notNull(),
    localPart: text("local_part").notNull(),
    status: mailcowAccountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("mailcow_account_userId_idx").on(table.userId),
    index("mailcow_account_email_idx").on(table.email),
    index("mailcow_account_status_idx").on(table.status),
    uniqueIndex("mailcow_account_userId_active_idx")
      .on(table.userId)
      .where(sql`status != 'deleted'`),
    uniqueIndex("mailcow_account_email_active_idx")
      .on(table.email)
      .where(sql`status != 'deleted'`),
  ]
);

export const selectMailcowAccountSchema = createSelectSchema(mailcowAccount);
export const insertMailcowAccountSchema = createInsertSchema(mailcowAccount);
