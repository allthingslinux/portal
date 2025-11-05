import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { and, eq } from 'drizzle-orm';

import { getLogger } from '@portal/shared/logger';
import type { Database } from '@portal/supabase/database';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import {
  accounts,
  accountsMemberships,
  rolePermissions,
  roles,
  userAccounts,
} from '@portal/supabase/drizzle-schema';

export function createTeamAccountsApi() {
  return new TeamAccountsApiDrizzle();
}

/**
 * Team Accounts API using Drizzle ORM
 */
class _TeamAccountsApi {
  private readonly namespace = 'team-accounts.api';

  /**
   * Get team account by slug
   */
  async getTeamAccount(slug: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select({
          id: accounts.id,
          name: accounts.name,
          slug: accounts.slug,
          primaryOwnerUserId: accounts.primaryOwnerUserId,
        })
        .from(accounts)
        .where(eq(accounts.slug, slug))
        .limit(1);
    });

    if (result.length === 0) {
      return {
        error: { message: 'Account not found' },
        data: null,
      };
    }

    return {
      error: null,
      data: result[0],
    };
  }

  /**
   * Get team account by ID
   */
  async getTeamAccountById(accountId: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select({
          id: accounts.id,
          name: accounts.name,
          slug: accounts.slug,
          primaryOwnerUserId: accounts.primaryOwnerUserId,
        })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);
    });

    if (result.length === 0) {
      return {
        error: { message: 'Account not found' },
        data: null,
      };
    }

    return {
      error: null,
      data: result[0],
    };
  }

  /**
   * Get account workspace data (replaces team_account_workspace RPC)
   */
  async getAccountWorkspace(slug: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    try {
      const accountResult = await drizzleClient.runTransaction(async (tx) => {
        return await tx
          .select({
            id: accounts.id,
            name: accounts.name,
            pictureUrl: accounts.pictureUrl,
            slug: accounts.slug,
            role: accountsMemberships.accountRole,
            roleHierarchyLevel: roles.hierarchyLevel,
            primaryOwnerUserId: accounts.primaryOwnerUserId,
            permissions: rolePermissions.permission,
          })
          .from(accounts)
          .innerJoin(
            accountsMemberships,
            eq(accounts.id, accountsMemberships.accountId),
          )
          .innerJoin(roles, eq(accountsMemberships.accountRole, roles.name))
          .leftJoin(
            rolePermissions,
            eq(accountsMemberships.accountRole, rolePermissions.role),
          )
          .where(eq(accounts.slug, slug));
      });

      const accountsResult = await drizzleClient.runTransaction(async (tx) => {
        return await tx.select().from(userAccounts);
      });

      if (accountResult.length === 0) {
        return {
          error: { message: 'Account not found or access denied' },
          data: null,
        };
      }

      // Group permissions by account (similar to the RPC)
      const accountData = accountResult[0];
      const permissions = accountResult
        .map((row) => row.permissions)
        .filter(Boolean) as string[];

      const workspaceData = {
        ...accountData,
        permissions,
      };

      return {
        error: null,
        data: {
          account: workspaceData,
          accounts: accountsResult.map((acc) => ({
            label: acc.name,
            value: acc.slug,
            image: acc.pictureUrl,
          })),
        },
      };
    } catch (error) {
      const logger = await getLogger();
      logger.error(
        { ...error, slug, namespace: this.namespace },
        'Failed to get account workspace',
      );

      return {
        error: { message: 'Failed to get account workspace' },
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
    permission: string;
  }) {
    const drizzleClient = await getDrizzleSupabaseClient();

    try {
      const result = await drizzleClient.runTransaction(async (tx) => {
        return await tx
          .select()
          .from(accountsMemberships)
          .innerJoin(
            rolePermissions,
            eq(accountsMemberships.accountRole, rolePermissions.role),
          )
          .where(
            and(
              eq(accountsMemberships.userId, params.userId),
              eq(accountsMemberships.accountId, params.accountId),
              eq(rolePermissions.permission, params.permission),
            ),
          )
          .limit(1);
      });

      return result.length > 0;
    } catch (error) {
      const logger = await getLogger();
      logger.error(
        { ...error, ...params, namespace: this.namespace },
        'Failed to check permission',
      );

      return false;
    }
  }

  /**
   * Get members count for an account
   */
  async getMembersCount(accountId: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    try {
      const result = await drizzleClient.runTransaction(async (tx) => {
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
        { ...error, accountId, namespace: this.namespace },
        'Failed to get members count',
      );

      return 0;
    }
  }

  /**
   * Get customer ID (placeholder - billing related)
   */
  async getCustomerId(_accountId: string) {
    // TODO: Implement when billing schema is available
    return null;
  }

  /**
   * @name getInvitation
   * @description Get an invitation by its token.
   * @param adminClient
   * @param token
   */
  async getInvitation(adminClient: SupabaseClient<Database>, token: string) {
    // Use admin client since the user is not yet part of the account
    const { data: invitation, error } = await adminClient
      .from('invitations')
      .select(
        `id,
        expires_at,
        email,
        account: account_id !inner (id, name, slug, picture_url)`,
      )
      .eq('invite_token', token)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) {
      return {
        error,
        data: null,
      };
    }

    return {
      error: null,
      data: invitation,
    };
  }

  /**
   * Get subscription (placeholder - billing related)
   */
  async getSubscription(_accountId: string) {
    // TODO: Implement when billing schema is available
    return {
      error: null,
      data: null,
    };
  }

  /**
   * Get order (placeholder - billing related)
   */
  async getOrder(_accountId: string) {
    // TODO: Implement when billing schema is available
    return {
      error: null,
      data: null,
    };
  }
}
