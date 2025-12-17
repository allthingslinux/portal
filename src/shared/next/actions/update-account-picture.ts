import "server-only";

import { and, eq } from "drizzle-orm";

import { betterAuthUserIdToUuid } from "~/core/auth/better-auth/utils/user-id-to-uuid";
import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";

/**
 * Shared utility to update account picture URL in the database.
 * Used by both personal and team account update actions.
 *
 * @param accountId - The account ID to update
 * @param pictureUrl - The new picture URL (or null to remove)
 * @param userId - The user ID performing the update (for authorization)
 */
export async function updateAccountPictureInDatabase(
  accountId: string,
  pictureUrl: string | null,
  userId?: string
) {
  const whereCondition = userId
    ? and(
        eq(accounts.id, accountId),
        eq(accounts.primaryOwnerUserId, betterAuthUserIdToUuid(userId))
      )
    : eq(accounts.id, accountId);

  await db.update(accounts).set({ pictureUrl }).where(whereCondition);
}
