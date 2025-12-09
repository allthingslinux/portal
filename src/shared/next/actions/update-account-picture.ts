import "server-only";

import { eq } from "drizzle-orm";

import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import { accounts } from "~/core/database/supabase/drizzle/schema";

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
  const drizzleClient = await getDrizzleSupabaseClient();

  await drizzleClient.runTransaction(async (tx) => {
    await tx
      .update(accounts)
      .set({ pictureUrl })
      .where(eq(accounts.id, accountId));
  });
}
