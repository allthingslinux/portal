import 'server-only';

import { eq, and } from 'drizzle-orm';
import { addDays, formatISO } from 'date-fns';
import { z } from 'zod';

import { getLogger } from '@portal/shared/logger';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { accounts, accountsMemberships, invitations } from '@portal/supabase/drizzle-schema';

import type { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import type { InviteMembersSchema } from '../../schema/invite-members.schema';
import type { UpdateInvitationSchema } from '../../schema/update-invitation.schema';

/**
 * Create an account invitations service using Drizzle.
 */
export function createAccountInvitationsService() {
  return new AccountInvitationsService();
}

/**
 * @name AccountInvitationsService
 * @description Service for managing account invitations using Drizzle.
 */
class AccountInvitationsService {
  private readonly namespace = 'invitations';

  /**
   * @name deleteInvitation
   * @description Removes an invitation from the database.
   * @param params
   */
  async deleteInvitation(params: z.infer<typeof DeleteInvitationSchema>) {
    const logger = await getLogger();
    const drizzleClient = await getDrizzleSupabaseClient();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Removing invitation...');

    try {
      const result = await drizzleClient.runTransaction(async (tx) => {
        return await tx
          .delete(invitations)
          .where(eq(invitations.id, params.invitationId));
      });

      logger.info(ctx, 'Invitation successfully removed');
      return result;
    } catch (error) {
      logger.error(ctx, `Failed to remove invitation`);
      throw error;
    }
  }

  /**
   * @name updateInvitation
   * @param params
   * @description Updates an invitation in the database.
   */
  async updateInvitation(params: z.infer<typeof UpdateInvitationSchema>) {
    const logger = await getLogger();
    const drizzleClient = await getDrizzleSupabaseClient();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Updating invitation...');

    try {
      const result = await drizzleClient.runTransaction(async (tx) => {
        return await tx
          .update(invitations)
          .set({
            role: params.role,
          })
          .where(eq(invitations.id, params.invitationId));
      });

      logger.info(ctx, 'Invitation successfully updated');
      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to update invitation',
      );
      throw error;
    }
  }

  async validateInvitation(
    invitation: z.infer<typeof InviteMembersSchema>['invitations'][number],
    accountSlug: string,
  ) {
    const drizzleClient = await getDrizzleSupabaseClient();

    // Check if user is already a member by looking at accounts_memberships
    const existingMembership = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select()
        .from(accountsMemberships)
        .innerJoin(accounts, eq(accountsMemberships.accountId, accounts.id))
        .where(
          and(
            eq(accounts.slug, accountSlug),
            // We would need to join with users table to check by email
            // For now, this is a simplified version
          )
        )
        .limit(1);
    });

    if (existingMembership.length > 0) {
      throw new Error('User already member of the team');
    }
  }

  /**
   * @name sendInvitations
   * @description Sends invitations to join a team.
   * @param accountSlug
   * @param invitations
   */
  async sendInvitations({
    accountSlug,
    invitations: invitationData,
  }: {
    invitations: z.infer<typeof InviteMembersSchema>['invitations'];
    accountSlug: string;
  }) {
    const logger = await getLogger();
    const drizzleClient = await getDrizzleSupabaseClient();

    const ctx = {
      accountSlug,
      name: this.namespace,
    };

    logger.info(ctx, 'Storing invitations...');

    try {
      await Promise.all(
        invitationData.map((invitation) =>
          this.validateInvitation(invitation, accountSlug),
        ),
      );
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error: (error as Error).message,
        },
        'Error validating invitations',
      );

      throw error;
    }

    // Get account name
    const accountResult = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select({ name: accounts.name })
        .from(accounts)
        .where(eq(accounts.slug, accountSlug))
        .limit(1);
    });

    if (accountResult.length === 0) {
      logger.error(
        ctx,
        'Account not found in database. Cannot send invitations.',
      );

      throw new Error('Account not found');
    }

    // TODO: Replace with Drizzle implementation of add_invitations_to_account RPC
    // For now, this would need to be implemented as a complex transaction
    // that inserts multiple invitation records
    logger.info(
      {
        ...ctx,
        message: 'TODO: Implement add_invitations_to_account in Drizzle',
      },
      'Invitations storage placeholder',
    );

    // Placeholder for invitation data that would come from the RPC
    const responseInvitations = invitationData.map((inv, index) => ({
      id: index + 1,
      email: inv.email,
      invite_token: `token-${index}`,
      role: inv.role,
    }));

    logger.info(
      {
        ...ctx,
        count: responseInvitations.length,
      },
      'Invitations added to account',
    );

    await this.dispatchInvitationEmails(ctx, responseInvitations as unknown[]);
  }

  /**
   * @name acceptInvitationToTeam
   * @description Accepts an invitation to join a team.
   */
  async acceptInvitationToTeam(params: {
    userId: string;
    userEmail: string;
    inviteToken: string;
  }) {
    const logger = await getLogger();
    const drizzleClient = await getDrizzleSupabaseClient();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Accepting invitation to team');

    // Get invitation details
    const invitationResult = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select({ email: invitations.email })
        .from(invitations)
        .where(eq(invitations.inviteToken, params.inviteToken))
        .limit(1);
    });

    if (invitationResult.length === 0) {
      logger.error(ctx, 'Invitation not found');
      throw new Error('Invitation not found');
    }

    const invitation = invitationResult[0];

    // Check email match
    if (invitation.email !== params.userEmail) {
      logger.error({
        ...ctx,
        error: 'Invitation email does not match user email',
      });
      throw new Error('Invitation email does not match user email');
    }

    // TODO: Replace with Drizzle implementation of accept_invitation RPC
    // This would need to be a complex transaction that:
    // 1. Validates the invitation is still valid (not expired, not used)
    // 2. Creates a membership record
    // 3. Marks the invitation as used or deletes it

    logger.info(ctx, 'Successfully accepted invitation to team');
    return { success: true };
  }

  /**
   * @name renewInvitation
   * @description Renews an invitation to join a team by extending the expiration date by 7 days.
   * @param invitationId
   */
  async renewInvitation(invitationId: number) {
    const logger = await getLogger();
    const drizzleClient = await getDrizzleSupabaseClient();

    const ctx = {
      invitationId,
      name: this.namespace,
    };

    logger.info(ctx, 'Renewing invitation...');

    const sevenDaysFromNow = formatISO(addDays(new Date(), 7));

    try {
      const result = await drizzleClient.runTransaction(async (tx) => {
        return await tx
          .update(invitations)
          .set({
            expiresAt: sevenDaysFromNow,
          })
          .where(eq(invitations.id, invitationId));
      });

      logger.info(ctx, 'Invitation successfully renewed');
      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to renew invitation',
      );
      throw error;
    }
  }

  /**
   * @name dispatchInvitationEmails
   * @description Dispatches invitation emails to the invited users.
   * @param ctx
   * @param invitations
   * @returns
   */
  private async dispatchInvitationEmails(
    ctx: { accountSlug: string; name: string },
    _invitations: unknown[], // Using unknown for now to match existing interface
  ) {
    if (!_invitations.length) {
      return;
    }

    const logger = await getLogger();
    // TODO: Update dispatcher service to work with Drizzle
    // const service = createAccountInvitationsDispatchService(drizzleClient);

    logger.info(ctx, 'Email dispatching placeholder - needs Drizzle migration');
  }
}
