import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    jid: text("jid").notNull().unique(), // Full JID: username@xmpp.atl.chat
    username: text("username").notNull().unique(), // XMPP localpart (username)
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
  ]
);
