import type { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import type { Database } from '@portal/supabase/database';
import { JWTUserData } from '@portal/supabase/types';

import { InviteMembersSchema } from '../../schema/invite-members.schema';
import type { FeaturePolicyInvitationContext } from './feature-policy-invitation-context';

/**
 * Creates an invitation context builder
 * @param client - The Supabase client
 * @returns
 */
export function createInvitationContextBuilder(
  client: SupabaseClient<Database>,
) {
  return new InvitationContextBuilder(client);
}

/**
 * Invitation context builder
 */
class InvitationContextBuilder {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * Build policy context for invitation evaluation with optimized parallel loading
   */
  async buildContext(
    params: z.infer<typeof InviteMembersSchema> & { accountSlug: string },
    user: JWTUserData,
  ): Promise<FeaturePolicyInvitationContext> {
    // Fetch all data in parallel for optimal performance
    const account = await this.getAccount(params.accountSlug);

    // Fetch subscription and member count in parallel using account ID
    const [subscription, memberCount] = await Promise.all([
      this.getSubscription(account.id),
      this.getMemberCount(account.id),
    ]);

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
    const { data: account } = await this.client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (!account) {
      throw new Error('Account not found');
    }

    return account;
  }

  /**
   * Gets the subscription from the database
   * @param accountId - The ID of the account to get the subscription for
   * @returns
   */
  private async getSubscription(accountId: string) {
    const { data: subscription } = await this.client
      .from('subscriptions')
      .select(
        `
        id,
        status,
        active,
        trial_starts_at,
        trial_ends_at,
        subscription_items(
          id,
          type,
          quantity,
          product_id,
          variant_id
        )
      `,
      )
      .eq('account_id', accountId)
      .eq('active', true)
      .single();

    return subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          active: subscription.active,
          trial_starts_at: subscription.trial_starts_at || undefined,
          trial_ends_at: subscription.trial_ends_at || undefined,
          items:
            subscription.subscription_items?.map((item) => ({
              id: item.id,
              type: item.type,
              quantity: item.quantity,
              product_id: item.product_id,
              variant_id: item.variant_id,
            })) || [],
        }
      : undefined;
  }

  /**
   * Gets the member count from the database
   * @param accountId - The ID of the account to get the member count for
   * @returns
   */
  private async getMemberCount(accountId: string) {
    const { count } = await this.client
      .from('accounts_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    return count || 0;
  }
}
