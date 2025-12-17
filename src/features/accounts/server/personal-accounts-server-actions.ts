"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { betterAuthUserIdToUuid } from "~/core/auth/better-auth/utils/user-id-to-uuid";
import { db } from "~/core/database/client";
import {
  accounts,
  accountsMemberships,
  betterAuthAccount,
  betterAuthUser,
  usersInAuth,
} from "~/core/database/schema";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";
import { revalidateAccountSettings } from "~/shared/next/actions/revalidate-account-paths";
import { updateAccountPictureInDatabase } from "~/shared/next/actions/update-account-picture";
import { createAdminAuthUserService } from "~/features/admin/lib/server/services/admin-auth-user.service";
import { getSessionUserData } from "~/core/auth/better-auth/session";

import { DeletePersonalAccountSchema } from "../schema/delete-personal-account.schema";
import { createDeletePersonalAccountService } from "./services/delete-personal-account.service";

const enableAccountDeletion =
  process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION === "true";

export async function refreshAuthSession() {
  // NextAuth handles session refresh automatically
  return {};
}

/**
 * Update account picture URL
 */
export async function updateAccountPictureUrlAction(
  accountId: string,
  pictureUrl: string | null
) {
  await updateAccountPictureInDatabase(accountId, pictureUrl);
  revalidateAccountSettings();
}

/**
 * Update account data (name, public_data, etc.)
 * Also syncs name changes to Better Auth user table and Keycloak
 */
export async function updateAccountDataAction(
  accountId: string,
  data: {
    name?: string | null;
    public_data?: Record<string, unknown> | null;
  }
) {
  const updateData: {
    name?: string;
    publicData?: Record<string, unknown>;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name ?? undefined;
  }
  if (data.public_data !== undefined) {
    updateData.publicData = data.public_data ?? undefined;
  }

  await db.update(accounts).set(updateData).where(eq(accounts.id, accountId));

  // If name was updated, sync to Better Auth user table and Keycloak
  if (data.name !== undefined && data.name !== null) {
    try {
      // Get current user session
      const user = await getSessionUserData();
      if (!user) {
        // Not authenticated, skip sync
        revalidateAccountSettings();
        return;
      }

      // Update Better Auth user table
      await db
        .update(betterAuthUser)
        .set({
          name: data.name,
          updatedAt: new Date(),
        })
        .where(eq(betterAuthUser.id, user.id));

      // Get Keycloak user ID (sub) from account record
      const accountRecords = await db
        .select({
          userId: betterAuthAccount.userId,
          providerId: betterAuthAccount.providerId,
        })
        .from(betterAuthAccount)
        .where(
          and(
            eq(betterAuthAccount.userId, user.id),
            eq(betterAuthAccount.providerId, "keycloak")
          )
        )
        .limit(1);

      if (accountRecords.length > 0) {
        // Get Keycloak user ID from accountId field (Better Auth stores the Keycloak sub here)
        const accountWithKeycloakId = await db
          .select({
            accountId: betterAuthAccount.accountId,
          })
          .from(betterAuthAccount)
          .where(
            and(
              eq(betterAuthAccount.userId, user.id),
              eq(betterAuthAccount.providerId, "keycloak")
            )
          )
          .limit(1);

        if (accountWithKeycloakId.length > 0 && accountWithKeycloakId[0].accountId) {
          try {
            // Update Keycloak user name via Admin API
            const adminService = createAdminAuthUserService();
            await adminService.updateUserName(
              accountWithKeycloakId[0].accountId,
              data.name
            );

            // Mark that we updated Keycloak to prevent immediate sync overwrite
            const { markKeycloakUpdate } = await import(
              "~/core/auth/better-auth/server/sync-user-from-keycloak"
            );
            await markKeycloakUpdate();
          } catch (adminError) {
            // Log error but don't fail the account update
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to sync name to Keycloak:", adminError);
            }
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the account update
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to sync name to Keycloak:", error);
      }
    }
  }

  revalidateAccountSettings();
}

/**
 * Get personal account data
 */
export async function getPersonalAccountDataAction(userId: string) {
  // Convert Better Auth user ID (text) to UUID for querying
  const userIdUuid = betterAuthUserIdToUuid(userId);

  const result = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      pictureUrl: accounts.pictureUrl,
      publicData: accounts.publicData,
    })
    .from(accounts)
    .where(
      and(
        eq(accounts.primaryOwnerUserId, userIdUuid),
        eq(accounts.isPersonalAccount, true)
      )
    )
    .limit(1);

  // If account doesn't exist, create it (for existing users who logged in before the hook was added)
  if (result.length === 0) {
    try {
      // Get Better Auth user data
      const betterAuthUserData = await db
        .select({
          id: betterAuthUser.id,
          name: betterAuthUser.name,
          email: betterAuthUser.email,
        })
        .from(betterAuthUser)
        .where(eq(betterAuthUser.id, userId))
        .limit(1);

      if (betterAuthUserData.length === 0) {
        return null;
      }

      const userData = betterAuthUserData[0];

      // Create personal account and membership in a transaction
      const [account] = await db.transaction(async (tx) => {
        // First, ensure the user exists in auth.users table
        await tx
          .insert(usersInAuth)
          .values({
            id: userIdUuid,
            email: userData.email || null,
          })
          .onConflictDoUpdate({
            target: usersInAuth.id,
            set: {
              email: userData.email || null,
            },
          });

        // Create the personal account
        const [newAccount] = await tx
          .insert(accounts)
          .values({
            primaryOwnerUserId: userIdUuid,
            name: userData.name || userData.email?.split("@")[0] || "User",
            isPersonalAccount: true,
            publicData: {},
          })
          .returning();

        if (!newAccount) {
          throw new Error("Failed to create personal account");
        }

        // Create membership record (required for user_accounts view)
        await tx.insert(accountsMemberships).values({
          userId: userIdUuid,
          accountId: newAccount.id,
          accountRole: "owner",
        });

      return [newAccount];
    });

    return {
        id: account.id,
        name: account.name,
        picture_url: account.pictureUrl,
        public_data: account.publicData,
      };
    } catch (error) {
      // If account creation fails, return null (don't throw - let the UI handle it)
      return null;
    }
  }

  const account = result[0];
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    picture_url: account.pictureUrl,
    public_data: account.publicData,
  };
}

export const deletePersonalAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    // validate the form data
    const { success } = DeletePersonalAccountSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "account.delete",
      userId: user.id,
    };

    if (!enableAccountDeletion) {
      logger.warn(ctx, "Account deletion is not enabled");

      throw new Error("Account deletion is not enabled");
    }

    logger.info(ctx, "Deleting account... (OTP verification removed)");

    // create a new instance of the personal accounts service
    const service = createDeletePersonalAccountService();

    // delete the user's account and cancel all subscriptions
    await service.deletePersonalAccount({
      account: {
        id: user.id,
        email: user.email ?? null,
      },
    });

    // sign out the user after deleting their account
    // NextAuth will handle sign out via redirect

    logger.info(ctx, "Account request successfully sent");

    // clear the cache for all pages
    revalidatePath("/", "layout");

    // redirect to the home page
    redirect("/");
  },
  {}
);
