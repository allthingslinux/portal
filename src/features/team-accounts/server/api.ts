import "server-only";

import { and, eq, gte } from "drizzle-orm";
import { db } from "~/core/database/client";
import {
  accounts,
  accountsMemberships,
  invitations,
  rolePermissions,
  roles,
} from "~/core/database/schema";
import { getLogger } from "~/shared/logger";

type AppPermission =
  | "roles.manage"
  | "settings.manage"
  | "members.manage"
  | "invites.manage";

type WorkspaceAccountItem = {
  id: string;
  name: string;
  slug: string | null;
  role: string | null;
  pictureUrl: string | null;
};

export function createTeamAccountsApi() {
  return new _TeamAccountsApi();
}

/**
 * Team Accounts API using Drizzle ORM
 */
class _TeamAccountsApi {
  private readonly namespace = "team-accounts.api";

  /**
   * Get team account by slug
   */
  async getTeamAccount(slug: string) {
    // Using shared Drizzle client

    const teamAccounts = await db.transaction(async (tx) =>
      tx
        .select({
          id: accounts.id,
          name: accounts.name,
          slug: accounts.slug,
          pictureUrl: accounts.pictureUrl,
          primaryOwnerUserId: accounts.primaryOwnerUserId,
        })
        .from(accounts)
        .where(eq(accounts.slug, slug))
        .limit(1)
    );

    if (teamAccounts.length === 0) {
      return {
        error: { message: "Account not found" },
        account: null,
      };
    }

    return {
      error: null,
      account: teamAccounts[0],
    };
  }

  /**
   * Get team account by ID
   */
  async getTeamAccountById(accountId: string) {
    // Using shared Drizzle client

    const teamAccounts = await db.transaction(async (tx) =>
      tx
        .select({
          id: accounts.id,
          name: accounts.name,
          slug: accounts.slug,
          primaryOwnerUserId: accounts.primaryOwnerUserId,
        })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1)
    );

    if (teamAccounts.length === 0) {
      return {
        error: { message: "Account not found" },
        account: null,
      };
    }

    return {
      error: null,
      account: teamAccounts[0],
    };
  }

  /**
   * Get account workspace data (replaces team_account_workspace RPC)
   */
  async getAccountWorkspace(slug: string, userId: string) {
    // Using shared Drizzle client

    try {
      const accountResult = await db.transaction(async (tx) =>
        tx
          .select({
            id: accounts.id,
            name: accounts.name,
            slug: accounts.slug,
            pictureUrl: accounts.pictureUrl,
            role: accountsMemberships.accountRole,
            roleHierarchyLevel: roles.hierarchyLevel,
            primaryOwnerUserId: accounts.primaryOwnerUserId,
            permissions: rolePermissions.permission,
          })
          .from(accounts)
          .innerJoin(
            accountsMemberships,
            eq(accounts.id, accountsMemberships.accountId)
          )
          .innerJoin(roles, eq(accountsMemberships.accountRole, roles.name))
          .leftJoin(
            rolePermissions,
            eq(accountsMemberships.accountRole, rolePermissions.role)
          )
          .where(
            and(
              eq(accounts.slug, slug),
              eq(accountsMemberships.userId, userId)
            )
          )
      );

      const teamAccounts = await db.transaction(async (tx) =>
        tx
          .select({
            id: accounts.id,
            name: accounts.name,
            slug: accounts.slug,
            role: accountsMemberships.accountRole,
            pictureUrl: accounts.pictureUrl,
          })
          .from(accounts)
          .innerJoin(
            accountsMemberships,
            eq(accounts.id, accountsMemberships.accountId)
          )
          .where(eq(accountsMemberships.userId, userId))
      );

      if (accountResult.length === 0) {
        return {
          error: { message: "Account not found or access denied" },
          workspace: null,
        };
      }

      // Group permissions by account (similar to the RPC)
      const accountRow = accountResult[0];
      const permissions = accountResult
        .map((row) => row.permissions)
        .filter((p): p is AppPermission => p !== null);

      const workspaceData = {
        id: accountRow.id,
        name: accountRow.name,
        slug: accountRow.slug ?? "",
        picture_url: accountRow.pictureUrl ?? "",
        permissions,
        role: accountRow.role,
        role_hierarchy_level: accountRow.roleHierarchyLevel,
        primary_owner_user_id: accountRow.primaryOwnerUserId,
      };

      return {
        error: null,
        workspace: {
          account: workspaceData,
          accounts: teamAccounts as WorkspaceAccountItem[],
        },
      };
    } catch (error) {
      const logger = await getLogger();
      logger.error(
        { error, slug, namespace: this.namespace },
        "Failed to get account workspace"
      );

      return {
        error: { message: "Failed to get account workspace" },
        data: null,
      };
    }
  }

  /**
   * Check if user has specific permission (replaces has_permission RPC)
   */
  async hasPermission(params: {
    accountId: string;
    userId: string;
    permission: AppPermission;
  }) {
    try {
      const result = await db.runTransaction(
        async (tx) =>
          await tx
            .select()
            .from(accountsMemberships)
            .innerJoin(
              rolePermissions,
              eq(accountsMemberships.accountRole, rolePermissions.role)
            )
            .where(
              and(
                eq(accountsMemberships.userId, params.userId),
                eq(accountsMemberships.accountId, params.accountId),
                eq(rolePermissions.permission, params.permission)
              )
            )
            .limit(1)
      );

      return result.length > 0;
    } catch (error) {
      const logger = await getLogger();
      logger.error(
        { error, params, namespace: this.namespace },
        "Failed to check permission"
      );

      return false;
    }
  }

  /**
   * Get members count for an account
   */
  async getMembersCount(accountId: string) {
    // Using shared Drizzle client

    try {
      const result = await db.runTransaction(async (tx) => {
        const countResult = await tx
          .select({ count: accountsMemberships.userId })
          .from(accountsMemberships)
          .where(eq(accountsMemberships.accountId, accountId));

        return countResult.length;
      });

      return result;
    } catch (error) {
      const logger = await getLogger();
      logger.error(
        { error, accountId, namespace: this.namespace },
        "Failed to get members count"
      );

      return 0;
    }
  }

  /**
   * @name getInvitation
   * @description Get an invitation by its token.
   * @param token
   */
  async getInvitation(token: string) {
    // Use admin client since the user is not yet part of the account
    // Using shared Drizzle client

    const invitationsResult = await db
      .select({
        id: invitations.id,
        expiresAt: invitations.expiresAt,
        email: invitations.email,
        account: {
          id: accounts.id,
          name: accounts.name,
          slug: accounts.slug,
          pictureUrl: accounts.pictureUrl,
        },
      })
      .from(invitations)
      .innerJoin(accounts, eq(invitations.accountId, accounts.id))
      .where(
        and(
          eq(invitations.inviteToken, token),
          gte(invitations.expiresAt, new Date().toISOString())
        )
      )
      .limit(1);

    if (invitationsResult.length === 0) {
      return {
        error: { message: "Invitation not found or expired" },
        invitation: null,
      };
    }

    const invitationRow = invitationsResult[0];

    return {
      error: null,
      invitation: {
        id: invitationRow.id,
        expires_at: invitationRow.expiresAt,
        email: invitationRow.email,
        account: {
          id: invitationRow.account.id,
          name: invitationRow.account.name,
          slug: invitationRow.account.slug,
          picture_url: invitationRow.account.pictureUrl,
        },
      },
    };
  }
}
