import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";
import { getLogger } from "~/shared/logger";

export function createUpdateTeamAccountService() {
  return new UpdateTeamAccountService();
}

class UpdateTeamAccountService {
  private readonly namespace = "team-accounts.update";

  async updateTeamName(params: { name: string; slug: string }) {
    const logger = await getLogger();
    const client = db;

    const ctx = {
      name: this.namespace,
      accountName: params.name,
      slug: params.slug,
    };

    logger.info(ctx, "Updating team name...");

    try {
      const result = await client
        .update(accounts)
        .set({
          name: params.name,
          slug: params.slug,
        })
        .where(eq(accounts.slug, params.slug))
        .returning({ slug: accounts.slug });

      if (result.length === 0) {
        throw new Error("Account not found or update failed");
      }

      const newSlug = result[0].slug;

      logger.info({ ...ctx, newSlug }, "Team name updated successfully");

      return { slug: newSlug };
    } catch (error) {
      logger.error({ ...ctx, error }, "Failed to update team name");
      throw error;
    }
  }
}
