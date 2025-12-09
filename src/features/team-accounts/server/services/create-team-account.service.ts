import "server-only";

import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import { accounts } from "~/core/database/supabase/drizzle/schema";
import { getLogger } from "~/shared/logger";

export function createCreateTeamAccountService() {
  return new CreateTeamAccountService();
}

class CreateTeamAccountService {
  private readonly namespace = "accounts.create-team-account";

  async createNewOrganizationAccount(params: { name: string; userId: string }) {
    const logger = await getLogger();
    const ctx = { ...params, namespace: this.namespace };

    logger.info(ctx, "Creating new team account...");

    // Check if team accounts are enabled (hardcoded for now)
    const teamAccountsEnabled = true; // TODO: Implement config check with Drizzle

    if (!teamAccountsEnabled) {
      logger.error(ctx, "Team accounts are not enabled");
      throw new Error("Team accounts are not enabled");
    }

    // Create the team account using Drizzle
    const drizzleClient = await getDrizzleSupabaseClient();

    try {
      const result = await drizzleClient.runTransaction(async (tx) => {
        const insertResult = await tx
          .insert(accounts)
          .values({
            name: params.name,
            isPersonalAccount: false,
          })
          .returning();

        if (insertResult.length === 0) {
          throw new Error("Failed to create team account");
        }

        return insertResult[0];
      });

      logger.info(ctx, "Team account created successfully");

      return { data: result, error: null };
    } catch (error) {
      logger.error(
        {
          error,
          ...ctx,
        },
        "Error creating team account"
      );

      throw new Error("Error creating team account");
    }
  }
}
