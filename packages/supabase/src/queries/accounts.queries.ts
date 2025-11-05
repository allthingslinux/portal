import 'server-only';

import { eq, and } from 'drizzle-orm';
import { accounts, accountsMemberships, usersInAuth } from '../drizzle/schema';

/**
 * Query builders for account-related operations
 */

/**
 * Get account by slug - Drizzle query builder
 */
export function getAccountBySlugQuery(slug: string) {
  return {
    select: {
      id: accounts.id,
      name: accounts.name,
      slug: accounts.slug,
      primaryOwnerUserId: accounts.primaryOwnerUserId,
      isPersonalAccount: accounts.isPersonalAccount,
    },
    from: accounts,
    where: eq(accounts.slug, slug),
  };
}

/**
 * Get account members with user details
 */
export function getAccountMembers(accountId: string) {
  return {
    select: {
      id: usersInAuth.id,
      role: accountsMemberships.accountRole,
      joinedAt: accountsMemberships.createdAt,
      // Add more user fields as needed based on your schema
    },
    from: accountsMemberships,
    joins: [
      {
        table: usersInAuth,
        on: eq(accountsMemberships.userId, usersInAuth.id),
      },
    ],
    where: eq(accountsMemberships.accountId, accountId),
  };
}

/**
 * Check if user has role on account
 */
export function hasRoleOnAccount(userId: string, accountId: string, role?: string) {
  const whereCondition = role
    ? and(
        eq(accountsMemberships.userId, userId),
        eq(accountsMemberships.accountId, accountId),
        eq(accountsMemberships.accountRole, role)
      )
    : and(
        eq(accountsMemberships.userId, userId),
        eq(accountsMemberships.accountId, accountId)
      );

  return {
    select: { count: true },
    from: accountsMemberships,
    where: whereCondition,
  };
}

/**
 * Get accounts for user (both personal and team accounts they belong to)
 */
export function getUserAccounts(userId: string) {
  return {
    select: {
      id: accounts.id,
      name: accounts.name,
      slug: accounts.slug,
      isPersonalAccount: accounts.isPersonalAccount,
      role: accountsMemberships.accountRole,
    },
    from: accounts,
    leftJoin: accountsMemberships,
    on: and(
      eq(accounts.id, accountsMemberships.accountId),
      eq(accountsMemberships.userId, userId)
    ),
    where: eq(accounts.primaryOwnerUserId, userId), // Either owner or member
  };
}
