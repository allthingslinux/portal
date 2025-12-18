import "server-only";

import { and, eq } from "drizzle-orm";

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
): Promise<boolean> {
  // Use raw userId instead of converting to UUID for database lookup
  const whereCondition = userId
    ? and(eq(accounts.id, accountId), eq(accounts.primaryOwnerUserId, userId))
    : eq(accounts.id, accountId);

  const result = await db
    .update(accounts)
    .set({ pictureUrl })
    .where(whereCondition)
    .returning({ id: accounts.id });

  return result.length > 0;
}
