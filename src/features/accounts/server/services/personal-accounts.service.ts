import { and, eq } from "drizzle-orm";
import { db } from "~/core/database/client";
import {
  accounts,
  accountsMemberships,
  betterAuthAccount,
  betterAuthUser,
} from "~/core/database/schema";
import { createAdminAuthUserService } from "~/features/admin/lib/server/services/admin-auth-user.service";
import { getLogger } from "~/shared/logger";

/**
 * Service for managing personal accounts
 */
export function createPersonalAccountsService() {
  const syncNameToAuthProviders = async (userId: string, name: string) => {
    await db
      .update(betterAuthUser)
      .set({ name, updatedAt: new Date() })
      .where(eq(betterAuthUser.id, userId));

    const [keycloakAccount] = await db
      .select({ accountId: betterAuthAccount.accountId })
      .from(betterAuthAccount)
      .where(
        and(
          eq(betterAuthAccount.userId, userId),
          eq(betterAuthAccount.providerId, "keycloak")
        )
      )
      .limit(1);

    if (keycloakAccount?.accountId) {
      const adminService = createAdminAuthUserService();
      await adminService.updateUserName(keycloakAccount.accountId, name);

      const { markKeycloakUpdate } = await import(
        "~/core/auth/better-auth/server/sync-user-from-keycloak"
      );
      await markKeycloakUpdate();
    }
  };

  const service = {
    async updateAccount(
      accountId: string,
      userId: string,
      data: {
        name?: string;
        publicData?: Record<string, unknown>;
      }
    ) {
      await db
        .update(accounts)
        .set(data)
        .where(
          and(
            eq(accounts.id, accountId),
            eq(accounts.primaryOwnerUserId, userId)
          )
        );

      if (data.name) {
        try {
          await syncNameToAuthProviders(userId, data.name);
        } catch (error) {
          const logger = await getLogger();
          logger.error(
            { error, userId },
            "Failed to sync account name to auth providers, but account update succeeded"
          );
        }
      }
    },

    async getAccount(userId: string) {
      // Use raw userId instead of converting to UUID after database migration
      const [account] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
          picture_url: accounts.pictureUrl,
          public_data: accounts.publicData,
        })
        .from(accounts)
        .where(
          and(
            eq(accounts.primaryOwnerUserId, userId),
            eq(accounts.isPersonalAccount, true)
          )
        )
        .limit(1);

      if (account) {
        return account;
      }

      return service.createPersonalAccount(userId);
    },

    async createPersonalAccount(userId: string) {
      const [userData] = await db
        .select({
          id: betterAuthUser.id,
          name: betterAuthUser.name,
          email: betterAuthUser.email,
        })
        .from(betterAuthUser)
        .where(eq(betterAuthUser.id, userId))
        .limit(1);

      if (!userData) {
        return null;
      }

      try {
        return await db.transaction(async (tx) => {
          const [newAccount] = await tx
            .insert(accounts)
            .values({
              primaryOwnerUserId: userId,
              name: userData.name || userData.email?.split("@")[0] || "User",
              isPersonalAccount: true,
              publicData: {},
            })
            .returning();

          if (!newAccount) {
            return null;
          }

          await tx.insert(accountsMemberships).values({
            userId,
            accountId: newAccount.id,
            accountRole: "owner",
          });

          return {
            id: newAccount.id,
            name: newAccount.name,
            picture_url: newAccount.pictureUrl,
            public_data: newAccount.publicData,
          };
        });
      } catch (_error) {
        return null;
      }
    },
  };

  return service;
}
