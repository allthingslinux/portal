import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "../auth";

export const integrationAccountStatusEnum = pgEnum(
  "integration_account_status",
  ["active", "suspended", "deleted"]
);

export const integrationAccount = pgTable(
  "integration_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    integrationType: text("integration_type").notNull(),
    status: integrationAccountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("integration_accounts_userId_idx").on(table.userId),
    index("integration_accounts_type_idx").on(table.integrationType),
    uniqueIndex("integration_accounts_userId_type_idx").on(
      table.userId,
      table.integrationType
    ),
  ]
);
