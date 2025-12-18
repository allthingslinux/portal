/* eslint-disable */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  inet,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  pgView,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const usersInAuth = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"),
});

export const appPermissions = pgEnum("app_permissions", [
  "roles.manage",
  "settings.manage",
  "members.manage",
  "invites.manage",
]);
export const notificationChannel = pgEnum("notification_channel", [
  "in_app",
  "email",
]);
export const notificationType = pgEnum("notification_type", [
  "info",
  "warning",
  "error",
]);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    primaryOwnerUserId: text("primary_owner_user_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: text(),
    email: varchar({ length: 320 }),
    isPersonalAccount: boolean("is_personal_account").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    pictureUrl: varchar("picture_url", { length: 1000 }),
    publicData: jsonb("public_data").default({}).notNull(),
  },
  (table) => [
    index("ix_accounts_is_personal_account").using(
      "btree",
      table.isPersonalAccount
    ),
    index("ix_accounts_primary_owner_user_id").using(
      "btree",
      table.primaryOwnerUserId
    ),
    uniqueIndex("unique_personal_account")
      .using("btree", table.primaryOwnerUserId)
      .where(sql`(is_personal_account = true)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [betterAuthUser.id],
      name: "accounts_created_by_fkey",
    }),
    foreignKey({
      columns: [table.primaryOwnerUserId],
      foreignColumns: [betterAuthUser.id],
      name: "accounts_primary_owner_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [betterAuthUser.id],
      name: "accounts_updated_by_fkey",
    }),
    unique("accounts_slug_key").on(table.slug),
    unique("accounts_email_key").on(table.email),
    check(
      "accounts_slug_null_if_personal_account_true",
      sql`((is_personal_account = true) AND (slug IS NULL)) OR ((is_personal_account = false) AND (slug IS NOT NULL))`
    ),
  ]
);

export const config = pgTable(
  "config",
  {
    enableTeamAccounts: boolean("enable_team_accounts").default(true).notNull(),
  },
  (_table) => []
);

export const invitations = pgTable(
  "invitations",
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    accountId: uuid("account_id").notNull(),
    invitedBy: text("invited_by").notNull(),
    role: varchar({ length: 50 }).notNull(),
    inviteToken: varchar("invite_token", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" })
      .default(sql`(CURRENT_TIMESTAMP + '7 days'::interval)`)
      .notNull(),
  },
  (table) => [
    index("ix_invitations_account_id").using("btree", table.accountId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: "invitations_account_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [betterAuthUser.id],
      name: "invitations_invited_by_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.role],
      foreignColumns: [roles.name],
      name: "invitations_role_fkey",
    }),
    unique("invitations_email_account_id_key").on(table.email, table.accountId),
    unique("invitations_invite_token_key").on(table.inviteToken),
  ]
);

export const nonces = pgTable(
  "nonces",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientToken: text("client_token").notNull(),
    nonce: text().notNull(),
    userId: text("user_id"),
    purpose: text().notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    revoked: boolean().default(false).notNull(),
    revokedReason: text("revoked_reason"),
    verificationAttempts: integer("verification_attempts").default(0).notNull(),
    lastVerificationAt: timestamp("last_verification_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastVerificationIp: inet("last_verification_ip"),
    lastVerificationUserAgent: text("last_verification_user_agent"),
    metadata: jsonb().default({}),
    scopes: text().array().default([""]),
  },
  (table) => [
    index("idx_nonces_status")
      .using(
        "btree",
        table.clientToken,
        table.userId,
        table.purpose,
        table.expiresAt
      )
      .where(sql`((used_at IS NULL) AND (revoked = false))`),
    index("idx_nonces_verify_lookup")
      .using("btree", table.purpose, table.expiresAt, table.userId)
      .where(sql`((used_at IS NULL) AND (revoked = false))`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [betterAuthUser.id],
      name: "nonces_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({
      name: "notifications_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    accountId: uuid("account_id").notNull(),
    type: notificationType().default("info").notNull(),
    body: varchar({ length: 5000 }).notNull(),
    link: varchar({ length: 255 }),
    channel: notificationChannel().default("in_app").notNull(),
    dismissed: boolean().default(false).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`(now() + '1 mon'::interval)`),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_notifications_account_dismissed").using(
      "btree",
      table.accountId,
      table.dismissed,
      table.expiresAt
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: "notifications_account_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "role_permissions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    role: varchar({ length: 50 }).notNull(),
    permission: appPermissions().notNull(),
  },
  (table) => [
    index("ix_role_permissions_role").using("btree", table.role),
    foreignKey({
      columns: [table.role],
      foreignColumns: [roles.name],
      name: "role_permissions_role_fkey",
    }),
    unique("role_permissions_role_permission_key").on(
      table.role,
      table.permission
    ),
  ]
);

export const roles = pgTable(
  "roles",
  {
    name: varchar({ length: 50 }).primaryKey().notNull(),
    hierarchyLevel: integer("hierarchy_level").notNull(),
  },
  (table) => [
    unique("roles_hierarchy_level_key").on(table.hierarchyLevel),
    check("roles_hierarchy_level_check", sql`hierarchy_level > 0`),
  ]
);

export const accountsMemberships = pgTable(
  "accounts_memberships",
  {
    userId: text("user_id").notNull(),
    accountId: uuid("account_id").notNull(),
    accountRole: varchar("account_role", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
  },
  (table) => [
    index("ix_accounts_memberships_account_id").using("btree", table.accountId),
    index("ix_accounts_memberships_account_role").using(
      "btree",
      table.accountRole
    ),
    index("ix_accounts_memberships_user_id").using("btree", table.userId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: "accounts_memberships_account_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.accountRole],
      foreignColumns: [roles.name],
      name: "accounts_memberships_account_role_fkey",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [betterAuthUser.id],
      name: "accounts_memberships_created_by_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [betterAuthUser.id],
      name: "accounts_memberships_updated_by_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [betterAuthUser.id],
      name: "accounts_memberships_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.accountId],
      name: "accounts_memberships_pkey",
    }),
  ]
);

export const userAccountWorkspace = pgView("user_account_workspace", {
  id: uuid(),
  name: varchar({ length: 255 }),
  pictureUrl: varchar("picture_url", { length: 1000 }),
}).existing();

export const userAccounts = pgView("user_accounts", {
  id: uuid(),
  name: varchar({ length: 255 }),
  pictureUrl: varchar("picture_url", { length: 1000 }),
  slug: text(),
  role: varchar({ length: 50 }),
}).existing();

// Better Auth tables - these are created automatically by Better Auth's Drizzle adapter
// but we define them here for type safety and migration tracking
export const betterAuthUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const betterAuthSession = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => betterAuthUser.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const betterAuthAccount = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => betterAuthUser.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const betterAuthVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
