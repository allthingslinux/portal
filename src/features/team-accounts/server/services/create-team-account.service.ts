import "server-only";
import slugify from "@sindresorhus/slugify";
import { eq } from "drizzle-orm";

import { db } from "~/core/database/client";
import { accounts, accountsMemberships } from "~/core/database/schema";
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

    // Generate a unique slug for the team account
    const baseSlug = slugify(params.name);
    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness
    while (true) {
      const existingAccount = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.slug, slug))
        .limit(1);

      if (existingAccount.length === 0) {
        break; // Slug is unique
      }

      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    // Create the team account using Drizzle
    try {
      const result = await db.transaction(async (tx) => {
        const insertResult = await tx
          .insert(accounts)
          .values({
            name: params.name,
            slug,
            primaryOwnerUserId: params.userId,
            isPersonalAccount: false,
            publicData: {},
          })
          .returning();

        if (insertResult.length === 0) {
          throw new Error("Failed to create team account");
        }

        const newAccount = insertResult[0];

        // Add the creator as a member with owner role
        await tx.insert(accountsMemberships).values({
          userId: params.userId,
          accountId: newAccount.id,
          accountRole: "owner",
        });

        return newAccount;
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
