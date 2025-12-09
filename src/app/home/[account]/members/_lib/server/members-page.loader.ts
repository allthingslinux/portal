import "server-only";

import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import {
  accounts,
  accountsMemberships,
  invitations,
} from "~/core/database/supabase/drizzle/schema";

import { loadTeamWorkspace } from "~/home/[account]/_lib/server/team-account-workspace.loader";

/**
 * Load data for the members page using Drizzle
 * @param slug
 */
export async function loadMembersPageData(slug: string) {
  const drizzleClient = await getDrizzleSupabaseClient();

  return Promise.all([
    loadAccountMembers(drizzleClient, slug),
    loadInvitations(drizzleClient, slug),
    canAddMember,
    loadTeamWorkspace(slug),
  ]);
}

/**
 * @name canAddMember
 * @description Check if the current user can add a member to the account
 *
 * This needs additional logic to determine if the user can add a member to the account
 * Please implement the logic and return a boolean value
 *
 * The same check needs to be added when creating an invitation
 *
 */
async function canAddMember() {
  return Promise.resolve(true);
}

/**
 * Load account members using Drizzle
 * @param drizzleClient
 * @param accountSlug
 */
async function loadAccountMembers(
  drizzleClient: Awaited<ReturnType<typeof getDrizzleSupabaseClient>>,
  accountSlug: string
) {
  const userAccount = alias(accounts, "userAccount");

  const data = await drizzleClient.runTransaction(
    async (tx) =>
      await tx
        .select({
          id: accountsMemberships.userId,
          userId: accountsMemberships.userId,
          accountId: accountsMemberships.accountId,
          role: accountsMemberships.accountRole,
          primaryOwnerUserId: accounts.primaryOwnerUserId,
          name: userAccount.name,
          email: userAccount.email,
          pictureUrl: userAccount.pictureUrl,
          createdAt: accountsMemberships.createdAt,
          updatedAt: accountsMemberships.updatedAt,
        })
        .from(accountsMemberships)
        .innerJoin(accounts, eq(accountsMemberships.accountId, accounts.id))
        .innerJoin(
          userAccount,
          eq(accountsMemberships.userId, userAccount.primaryOwnerUserId)
        )
        .where(eq(accounts.slug, accountSlug))
  );

  return (data ?? []) as unknown[];
}

/**
 * Load account invitations using Drizzle
 * @param drizzleClient
 * @param accountSlug
 */
async function loadInvitations(
  drizzleClient: Awaited<ReturnType<typeof getDrizzleSupabaseClient>>,
  accountSlug: string
) {
  const data = await drizzleClient.runTransaction(
    async (tx) =>
      await tx
        .select({
          id: invitations.id,
          email: invitations.email,
          role: invitations.role,
          createdAt: invitations.createdAt,
          updatedAt: invitations.updatedAt,
          expiresAt: invitations.expiresAt,
          invitedBy: {
            id: invitations.invitedBy,
          },
        })
        .from(invitations)
        .innerJoin(accounts, eq(invitations.accountId, accounts.id))
        .where(eq(accounts.slug, accountSlug))
  );

  return (data ?? []) as unknown[];
}
