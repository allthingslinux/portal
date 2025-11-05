import { relations } from 'drizzle-orm/relations';

import {
  accounts,
  accountsMemberships,
  invitations,
  nonces,
  notifications,
  rolePermissions,
  roles,
  usersInAuth,
} from './schema';

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [accounts.createdBy],
    references: [usersInAuth.id],
    relationName: 'accounts_createdBy_usersInAuth_id',
  }),
  usersInAuth_primaryOwnerUserId: one(usersInAuth, {
    fields: [accounts.primaryOwnerUserId],
    references: [usersInAuth.id],
    relationName: 'accounts_primaryOwnerUserId_usersInAuth_id',
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [accounts.updatedBy],
    references: [usersInAuth.id],
    relationName: 'accounts_updatedBy_usersInAuth_id',
  }),
  invitations: many(invitations),
  notifications: many(notifications),
  accountsMemberships: many(accountsMemberships),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  accounts_createdBy: many(accounts, {
    relationName: 'accounts_createdBy_usersInAuth_id',
  }),
  accounts_primaryOwnerUserId: many(accounts, {
    relationName: 'accounts_primaryOwnerUserId_usersInAuth_id',
  }),
  accounts_updatedBy: many(accounts, {
    relationName: 'accounts_updatedBy_usersInAuth_id',
  }),
  invitations: many(invitations),
  nonces: many(nonces),
  accountsMemberships_createdBy: many(accountsMemberships, {
    relationName: 'accountsMemberships_createdBy_usersInAuth_id',
  }),
  accountsMemberships_updatedBy: many(accountsMemberships, {
    relationName: 'accountsMemberships_updatedBy_usersInAuth_id',
  }),
  accountsMemberships_userId: many(accountsMemberships, {
    relationName: 'accountsMemberships_userId_usersInAuth_id',
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  account: one(accounts, {
    fields: [invitations.accountId],
    references: [accounts.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [invitations.invitedBy],
    references: [usersInAuth.id],
  }),
  role: one(roles, {
    fields: [invitations.role],
    references: [roles.name],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  invitations: many(invitations),
  rolePermissions: many(rolePermissions),
  accountsMemberships: many(accountsMemberships),
}));

export const noncesRelations = relations(nonces, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [nonces.userId],
    references: [usersInAuth.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  account: one(accounts, {
    fields: [notifications.accountId],
    references: [accounts.id],
  }),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.role],
      references: [roles.name],
    }),
  }),
);

export const accountsMembershipsRelations = relations(
  accountsMemberships,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountsMemberships.accountId],
      references: [accounts.id],
    }),
    role: one(roles, {
      fields: [accountsMemberships.accountRole],
      references: [roles.name],
    }),
    usersInAuth_createdBy: one(usersInAuth, {
      fields: [accountsMemberships.createdBy],
      references: [usersInAuth.id],
      relationName: 'accountsMemberships_createdBy_usersInAuth_id',
    }),
    usersInAuth_updatedBy: one(usersInAuth, {
      fields: [accountsMemberships.updatedBy],
      references: [usersInAuth.id],
      relationName: 'accountsMemberships_updatedBy_usersInAuth_id',
    }),
    usersInAuth_userId: one(usersInAuth, {
      fields: [accountsMemberships.userId],
      references: [usersInAuth.id],
      relationName: 'accountsMemberships_userId_usersInAuth_id',
    }),
  }),
);
