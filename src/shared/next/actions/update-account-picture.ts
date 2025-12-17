import "server-only";

import { eq } from "drizzle-orm";

import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";

/**
 * Shared utility to update account picture URL in the database.
 * Used by both personal and team account update actions.
 *
 * @param accountId - The account ID to update
 * @param pictureUrl - The new picture URL (or null to remove)
 */
export async function updateAccountPictureInDatabase(
  accountId: string,
  pictureUrl: string | null
) {
  await db
    .update(accounts)
    .set({ pictureUrl })
    .where(eq(accounts.id, accountId));
}
