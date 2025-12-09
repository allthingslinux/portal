import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import {
  accounts,
  accountsMemberships,
} from "~/core/database/supabase/drizzle/schema";

import type { InviteMembersSchema } from "../../schema/invite-members.schema";
import type { FeaturePolicyInvitationContext } from "./feature-policy-invitation-context";

/**
 * Creates an invitation context builder
 * @returns
 */
export function createInvitationContextBuilder() {
  return new InvitationContextBuilder();
}

/**
 * Invitation context builder
 */
class InvitationContextBuilder {
  /**
   * Build policy context for invitation evaluation with optimized parallel loading
   */
  async buildContext(
    params: z.infer<typeof InviteMembersSchema> & { accountSlug: string },
    user: BetterAuthUser
  ): Promise<FeaturePolicyInvitationContext> {
    // Fetch all data in parallel for optimal performance
    const account = await this.getAccount(params.accountSlug);

    // Fetch member count (no subscription functionality)
    const memberCount = await this.getMemberCount(account.id);
    const subscription = undefined;

    return {
      // Base PolicyContext fields
      timestamp: new Date().toISOString(),
      metadata: {
        accountSlug: params.accountSlug,
        invitationCount: params.invitations.length,
        invitingUserEmail: user.email as string,
      },

      // Invitation-specific fields
      accountSlug: params.accountSlug,
      accountId: account.id,
      subscription,
      currentMemberCount: memberCount,
      invitations: params.invitations,
      invitingUser: {
        id: user.id,
        email: user.email,
      },
    };
  }

  /**
   * Gets the account from the database
   * @param accountSlug - The slug of the account to get
   * @returns
   */
  private async getAccount(accountSlug: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(
      async (tx) =>
        await tx
          .select({ id: accounts.id })
          .from(accounts)
          .where(eq(accounts.slug, accountSlug))
          .limit(1)
    );

    if (result.length === 0) {
      throw new Error("Account not found");
    }

    return result[0];
  }

  /**
   * Gets the member count from the database
   * @param accountId - The ID of the account to get the member count for
   * @returns
   */
  private async getMemberCount(accountId: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(async (tx) => {
      const countResult = await tx
        .select({ count: accountsMemberships.userId })
        .from(accountsMemberships)
        .where(eq(accountsMemberships.accountId, accountId));

      return countResult.length;
    });

    return result;
  }
}
