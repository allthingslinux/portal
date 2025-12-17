import "server-only";

import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "~/core/database/client";
import {
  accounts,
  accountsMemberships,
  invitations,
  roles,
} from "~/core/database/schema";

import { loadTeamWorkspace } from "~/home/[account]/_lib/server/team-account-workspace.loader";

type MemberRow = {
  id: string;
  user_id: string;
  account_id: string;
  role: string;
  primary_owner_user_id: string;
  name: string;
  email: string;
  picture_url: string;
  created_at: string;
  updated_at: string;
  role_hierarchy_level: number;
};

type InvitationRow = {
  id: number;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  account_id: string;
  invited_by: string;
  inviter_email: string;
  inviter_name: string;
};

/**
 * Load data for the members page using Drizzle
 * @param slug
 */
export async function loadMembersPageData(
  slug: string
): Promise<
  [
    MemberRow[],
    InvitationRow[],
    boolean,
    Awaited<ReturnType<typeof loadTeamWorkspace>>,
  ]
> {
  const drizzleClient = db;

  const [members, invites, canAdd, workspace] = await Promise.all([
    loadAccountMembers(drizzleClient, slug),
    loadInvitations(drizzleClient, slug),
    canAddMember(),
    loadTeamWorkspace(slug),
  ]);

  return [members, invites, canAdd, workspace];
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
  drizzleClient: typeof db,
  accountSlug: string
): Promise<MemberRow[]> {
  const userAccount = alias(accounts, "userAccount");
  const roleTable = alias(roles, "roleTable");

  const data = (await drizzleClient
    .select({
      id: accountsMemberships.userId,
      user_id: accountsMemberships.userId,
      account_id: accountsMemberships.accountId,
      role: accountsMemberships.accountRole,
      primary_owner_user_id: accounts.primaryOwnerUserId,
      name: userAccount.name,
      email: userAccount.email,
      picture_url: userAccount.pictureUrl,
      created_at: accountsMemberships.createdAt,
      updated_at: accountsMemberships.updatedAt,
      role_hierarchy_level: roleTable.hierarchyLevel,
    })
    .from(accountsMemberships)
    .innerJoin(accounts, eq(accountsMemberships.accountId, accounts.id))
    .innerJoin(
      userAccount,
      eq(accountsMemberships.userId, userAccount.primaryOwnerUserId)
    )
    .innerJoin(roleTable, eq(accountsMemberships.accountRole, roleTable.name))
    .where(eq(accounts.slug, accountSlug))) as MemberRow[];

  return (data ?? []).map((row) => ({
    ...row,
    email: row.email ?? "",
    name: row.name ?? "",
    picture_url: row.picture_url ?? "",
  }));
}

/**
 * Load account invitations using Drizzle
 * @param drizzleClient
 * @param accountSlug
 */
async function loadInvitations(
  drizzleClient: typeof db,
  accountSlug: string
): Promise<InvitationRow[]> {
  const data = (await drizzleClient
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      created_at: invitations.createdAt,
      updated_at: invitations.updatedAt,
      expires_at: invitations.expiresAt,
      account_id: invitations.accountId,
      invited_by: invitations.invitedBy,
      inviter_email: accounts.email,
      inviter_name: accounts.name,
    })
    .from(invitations)
    .innerJoin(accounts, eq(invitations.accountId, accounts.id))
    .where(eq(accounts.slug, accountSlug))) as InvitationRow[];

  return (data ?? []).map((row) => ({
    ...row,
    inviter_email: row.inviter_email ?? "",
    inviter_name: row.inviter_name ?? "",
  }));
}
