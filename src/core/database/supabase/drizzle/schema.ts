/* eslint-disable */
import { sql } from 'drizzle-orm';
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
  pgPolicy,
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
} from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

export const usersInAuth = authSchema.table('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
});

export const appPermissions = pgEnum('app_permissions', [
  'roles.manage',
  'settings.manage',
  'members.manage',
  'invites.manage',
]);
export const notificationChannel = pgEnum('notification_channel', [
  'in_app',
  'email',
]);
export const notificationType = pgEnum('notification_type', [
  'info',
  'warning',
  'error',
]);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    primaryOwnerUserId: uuid('primary_owner_user_id')
      .default(sql`auth.uid()`)
      .notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: text(),
    email: varchar({ length: 320 }),
    isPersonalAccount: boolean('is_personal_account').default(false).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    publicData: jsonb('public_data').default({}).notNull(),
  },
  (table) => [
    index('ix_accounts_is_personal_account').using(
      'btree',
      table.isPersonalAccount.asc().nullsLast().op('bool_ops'),
    ),
    index('ix_accounts_primary_owner_user_id').using(
      'btree',
      table.primaryOwnerUserId.asc().nullsLast().op('uuid_ops'),
    ),
    uniqueIndex('unique_personal_account')
      .using('btree', table.primaryOwnerUserId.asc().nullsLast().op('uuid_ops'))
      .where(sql`(is_personal_account = true)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [usersInAuth.id],
      name: 'accounts_created_by_fkey',
    }),
    foreignKey({
      columns: [table.primaryOwnerUserId],
      foreignColumns: [usersInAuth.id],
      name: 'accounts_primary_owner_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [usersInAuth.id],
      name: 'accounts_updated_by_fkey',
    }),
    unique('accounts_slug_key').on(table.slug),
    unique('accounts_email_key').on(table.email),
    pgPolicy('accounts_read', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`((( SELECT auth.uid() AS uid) = primary_owner_user_id) OR has_role_on_account(id) OR is_account_team_member(id))`,
    }),
    pgPolicy('accounts_self_update', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('create_org_account', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
    }),
    pgPolicy('delete_team_account', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
    }),
    pgPolicy('restrict_mfa_accounts', {
      as: 'restrictive',
      for: 'all',
      to: ['authenticated'],
    }),
    pgPolicy('super_admins_access_accounts', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    check(
      'accounts_slug_null_if_personal_account_true',
      sql`((is_personal_account = true) AND (slug IS NULL)) OR ((is_personal_account = false) AND (slug IS NOT NULL))`,
    ),
  ],
);

export const config = pgTable(
  'config',
  {
    enableTeamAccounts: boolean('enable_team_accounts').default(true).notNull(),
  },
  (table) => [
    pgPolicy('public config can be read by authenticated users', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ],
);

export const invitations = pgTable(
  'invitations',
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    accountId: uuid('account_id').notNull(),
    invitedBy: uuid('invited_by').notNull(),
    role: varchar({ length: 50 }).notNull(),
    inviteToken: varchar('invite_token', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' })
      .default(sql`(CURRENT_TIMESTAMP + '7 days'::interval)`)
      .notNull(),
  },
  (table) => [
    index('ix_invitations_account_id').using(
      'btree',
      table.accountId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: 'invitations_account_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [usersInAuth.id],
      name: 'invitations_invited_by_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.role],
      foreignColumns: [roles.name],
      name: 'invitations_role_fkey',
    }),
    unique('invitations_email_account_id_key').on(table.email, table.accountId),
    unique('invitations_invite_token_key').on(table.inviteToken),
    pgPolicy('super_admins_access_invitations', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`is_super_admin()`,
    }),
    pgPolicy('invitations_create_self', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
    }),
    pgPolicy('invitations_delete', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
    }),
    pgPolicy('invitations_read_self', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    pgPolicy('invitations_update', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('restrict_mfa_invitations', {
      as: 'restrictive',
      for: 'all',
      to: ['authenticated'],
    }),
  ],
);

export const nonces = pgTable(
  'nonces',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientToken: text('client_token').notNull(),
    nonce: text().notNull(),
    userId: uuid('user_id'),
    purpose: text().notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    usedAt: timestamp('used_at', { withTimezone: true, mode: 'string' }),
    revoked: boolean().default(false).notNull(),
    revokedReason: text('revoked_reason'),
    verificationAttempts: integer('verification_attempts').default(0).notNull(),
    lastVerificationAt: timestamp('last_verification_at', {
      withTimezone: true,
      mode: 'string',
    }),
    lastVerificationIp: inet('last_verification_ip'),
    lastVerificationUserAgent: text('last_verification_user_agent'),
    metadata: jsonb().default({}),
    scopes: text().array().default(['']),
  },
  (table) => [
    index('idx_nonces_status')
      .using(
        'btree',
        table.clientToken.asc().nullsLast().op('text_ops'),
        table.userId.asc().nullsLast().op('text_ops'),
        table.purpose.asc().nullsLast().op('text_ops'),
        table.expiresAt.asc().nullsLast().op('text_ops'),
      )
      .where(sql`((used_at IS NULL) AND (revoked = false))`),
    index('idx_nonces_verify_lookup')
      .using(
        'btree',
        table.purpose.asc().nullsLast().op('text_ops'),
        table.expiresAt.desc().nullsFirst().op('text_ops'),
        table.userId.asc().nullsLast().op('text_ops'),
      )
      .where(sql`((used_at IS NULL) AND (revoked = false))`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: 'nonces_user_id_fkey',
    }).onDelete('cascade'),
    pgPolicy('Users can read their own nonces', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`(user_id = ( SELECT auth.uid() AS uid))`,
    }),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: 'notifications_id_seq',
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 9223372036854775807,
        cache: 1,
      }),
    accountId: uuid('account_id').notNull(),
    type: notificationType().default('info').notNull(),
    body: varchar({ length: 5000 }).notNull(),
    link: varchar({ length: 255 }),
    channel: notificationChannel().default('in_app').notNull(),
    dismissed: boolean().default(false).notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).default(sql`(now() + '1 mon'::interval)`),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_notifications_account_dismissed').using(
      'btree',
      table.accountId.asc().nullsLast().op('timestamptz_ops'),
      table.dismissed.asc().nullsLast().op('timestamptz_ops'),
      table.expiresAt.asc().nullsLast().op('timestamptz_ops'),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: 'notifications_account_id_fkey',
    }).onDelete('cascade'),
    pgPolicy('notifications_read_self', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`((account_id = ( SELECT auth.uid() AS uid)) OR has_role_on_account(account_id))`,
    }),
    pgPolicy('notifications_update_self', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
    }),
    pgPolicy('restrict_mfa_notifications', {
      as: 'restrictive',
      for: 'all',
      to: ['authenticated'],
    }),
  ],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: 'role_permissions_id_seq',
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 9223372036854775807,
        cache: 1,
      }),
    role: varchar({ length: 50 }).notNull(),
    permission: appPermissions().notNull(),
  },
  (table) => [
    index('ix_role_permissions_role').using(
      'btree',
      table.role.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.role],
      foreignColumns: [roles.name],
      name: 'role_permissions_role_fkey',
    }),
    unique('role_permissions_role_permission_key').on(
      table.role,
      table.permission,
    ),
    pgPolicy('restrict_mfa_role_permissions', {
      as: 'restrictive',
      for: 'all',
      to: ['authenticated'],
      using: sql`is_mfa_compliant()`,
    }),
    pgPolicy('role_permissions_read', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    pgPolicy('super_admins_access_role_permissions', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
  ],
);

export const roles = pgTable(
  'roles',
  {
    name: varchar({ length: 50 }).primaryKey().notNull(),
    hierarchyLevel: integer('hierarchy_level').notNull(),
  },
  (table) => [
    unique('roles_hierarchy_level_key').on(table.hierarchyLevel),
    pgPolicy('roles_read', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`true`,
    }),
    check('roles_hierarchy_level_check', sql`hierarchy_level > 0`),
  ],
);

export const accountsMemberships = pgTable(
  'accounts_memberships',
  {
    userId: uuid('user_id').notNull(),
    accountId: uuid('account_id').notNull(),
    accountRole: varchar('account_role', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (table) => [
    index('ix_accounts_memberships_account_id').using(
      'btree',
      table.accountId.asc().nullsLast().op('uuid_ops'),
    ),
    index('ix_accounts_memberships_account_role').using(
      'btree',
      table.accountRole.asc().nullsLast().op('text_ops'),
    ),
    index('ix_accounts_memberships_user_id').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: 'accounts_memberships_account_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.accountRole],
      foreignColumns: [roles.name],
      name: 'accounts_memberships_account_role_fkey',
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [usersInAuth.id],
      name: 'accounts_memberships_created_by_fkey',
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [usersInAuth.id],
      name: 'accounts_memberships_updated_by_fkey',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: 'accounts_memberships_user_id_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.userId, table.accountId],
      name: 'accounts_memberships_pkey',
    }),
    pgPolicy('accounts_memberships_delete', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`((user_id = ( SELECT auth.uid() AS uid)) OR can_action_account_member(account_id, user_id))`,
    }),
    pgPolicy('accounts_memberships_read', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
    pgPolicy('restrict_mfa_accounts_memberships', {
      as: 'restrictive',
      for: 'all',
      to: ['authenticated'],
    }),
    pgPolicy('super_admins_access_accounts_memberships', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
    }),
  ],
);
export const userAccountWorkspace = pgView('user_account_workspace', {
  id: uuid(),
  name: varchar({ length: 255 }),
  pictureUrl: varchar('picture_url', { length: 1000 }),
}).as(
  sql`SELECT id, name, picture_url FROM accounts WHERE primary_owner_user_id = (( SELECT auth.uid() AS uid)) AND is_personal_account = true LIMIT 1`,
);

export const userAccounts = pgView('user_accounts', {
  id: uuid(),
  name: varchar({ length: 255 }),
  pictureUrl: varchar('picture_url', { length: 1000 }),
  slug: text(),
  role: varchar({ length: 50 }),
}).as(
  sql`SELECT account.id, account.name, account.picture_url, account.slug, membership.account_role AS role FROM accounts account JOIN accounts_memberships membership ON account.id = membership.account_id WHERE membership.user_id = (( SELECT auth.uid() AS uid)) AND account.is_personal_account = false AND (account.id IN ( SELECT accounts_memberships.account_id FROM accounts_memberships WHERE accounts_memberships.user_id = (( SELECT auth.uid() AS uid))))`,
);
