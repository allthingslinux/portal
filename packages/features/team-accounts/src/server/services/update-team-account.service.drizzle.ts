import 'server-only';

import { eq } from 'drizzle-orm';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { accounts } from '@portal/supabase/drizzle-schema';
import { getLogger } from '@portal/shared/logger';

export function createUpdateTeamAccountService() {
  return new UpdateTeamAccountService();
}

class UpdateTeamAccountService {
  private readonly namespace = 'team-accounts.update';

  async updateTeamName(params: { name: string; slug: string }) {
    const logger = await getLogger();
    const client = await getDrizzleSupabaseClient();

    const ctx = {
      name: this.namespace,
      accountName: params.name,
      slug: params.slug,
    };

    logger.info(ctx, 'Updating team name...');

    try {
      const result = await client.runTransaction(async (tx) => {
        return await tx
          .update(accounts)
          .set({
            name: params.name,
            slug: params.slug,
          })
          .where(eq(accounts.slug, params.slug))
          .returning({ slug: accounts.slug });
      });

      if (result.length === 0) {
        throw new Error('Account not found or update failed');
      }

      const newSlug = result[0].slug;

      logger.info({ ...ctx, newSlug }, 'Team name updated successfully');

      return { slug: newSlug };
    } catch (error) {
      logger.error({ ...ctx, error }, 'Failed to update team name');
      throw error;
    }
  }
}
