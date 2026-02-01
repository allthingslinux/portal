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
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "./auth";

// XMPP account status enum
export const xmppAccountStatusEnum = pgEnum("xmpp_account_status", [
  "active",
  "suspended",
  "deleted",
]);

export const xmppAccount = pgTable(
  "xmpp_account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jid: text("jid").notNull(), // Full JID: username@xmpp.atl.chat
    username: text("username").notNull(), // XMPP localpart (username)
    status: xmppAccountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    metadata: jsonb("metadata"), // Optional JSONB for additional data
  },
  (table) => [
    index("xmpp_account_userId_idx").on(table.userId),
    index("xmpp_account_jid_idx").on(table.jid),
    index("xmpp_account_username_idx").on(table.username),
    index("xmpp_account_status_idx").on(table.status),
    uniqueIndex("xmpp_account_userId_active_idx")
      .on(table.userId)
      .where(sql`status != 'deleted'`),
    uniqueIndex("xmpp_account_jid_active_idx")
      .on(table.jid)
      .where(sql`status != 'deleted'`),
    uniqueIndex("xmpp_account_username_active_idx")
      .on(table.username)
      .where(sql`status != 'deleted'`),
  ]
);

// Zod schemas generated from Drizzle table
export const selectXmppAccountSchema = createSelectSchema(xmppAccount);
export const insertXmppAccountSchema = createInsertSchema(xmppAccount);
