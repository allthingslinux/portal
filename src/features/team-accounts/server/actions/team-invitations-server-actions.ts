'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { enhanceAction } from '~/shared/next/actions';
import { revalidateAccountMembers } from '~/shared/next/actions/revalidate-account-paths';
import { getLogger } from '~/shared/logger';
import { JWTUserData } from '~/core/database/supabase/types';

import { AcceptInvitationSchema } from '../../schema/accept-invitation.schema';
import { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { RenewInvitationSchema } from '../../schema/renew-invitation.schema';
import { UpdateInvitationSchema } from '../../schema/update-invitation.schema';
import { createInvitationContextBuilder } from '../policies/invitation-context-builder';
import { createInvitationsPolicyEvaluator } from '../policies/invitation-policies';
import { createAccountInvitationsService } from '../services/account-invitations.service';

/**
 * @name createInvitationsAction
 * @description Creates invitations for inviting members.
 */
export const createInvitationsAction = enhanceAction(
  async (params, user) => {
    const logger = await getLogger();

    logger.info(
      { params, userId: user.id },
      'User requested to send invitations',
    );

    // Evaluate invitation policies
    const policiesResult = await evaluateInvitationsPolicies(params, user);

    // If the invitations are not allowed, throw an error
    if (!policiesResult.allowed) {
      logger.info(
        { reasons: policiesResult?.reasons, userId: user.id },
        'Invitations blocked by policies',
      );

      return {
        success: false,
        reasons: policiesResult?.reasons,
      };
    }

    // invitations are allowed, so continue with the action
    const service = createAccountInvitationsService();

    try {
      await service.sendInvitations(params);

      revalidateMemberPage();

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
      };
    }
  },
  {
    schema: InviteMembersSchema.and(
      z.object({
        accountSlug: z.string().min(1),
      }),
    ),
  },
);

/**
 * @name deleteInvitationAction
 * @description Deletes an invitation specified by the invitation ID.
 */
export const deleteInvitationAction = enhanceAction(
  async (data) => {
    const service = createAccountInvitationsService();

    // Delete the invitation
    await service.deleteInvitation(data);

    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: DeleteInvitationSchema,
  },
);

/**
 * @name updateInvitationAction
 * @description Updates an invitation.
 */
export const updateInvitationAction = enhanceAction(
  async (invitation) => {
    const service = createAccountInvitationsService();

    await service.updateInvitation(invitation);

    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: UpdateInvitationSchema,
  },
);

/**
 * @name acceptInvitationAction
 * @description Accepts an invitation to join a team.
 */
export const acceptInvitationAction = enhanceAction(
  async (data: FormData, user) => {
    const { inviteToken, nextPath } = AcceptInvitationSchema.parse(
      Object.fromEntries(data),
    );

    // create the services
    const service = createAccountInvitationsService();

    // Accept the invitation
    const result = await service.acceptInvitationToTeam({
      inviteToken,
      userId: user.id,
      userEmail: user.email,
    });

    const accountId = result.success ? 'placeholder' : null;

    // If the account ID is not present, throw an error
    if (!accountId) {
      throw new Error('Failed to accept invitation');
    }

    return redirect(nextPath);
  },
  {},
);

/**
 * @name renewInvitationAction
 * @description Renews an invitation.
 */
export const renewInvitationAction = enhanceAction(
  async (params) => {
    const { invitationId } = RenewInvitationSchema.parse(params);

    const service = createAccountInvitationsService();

    // Renew the invitation
    await service.renewInvitation(invitationId);

    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: RenewInvitationSchema,
  },
);

function revalidateMemberPage() {
  revalidateAccountMembers();
}

/**
 * @name evaluateInvitationsPolicies
 * @description Evaluates invitation policies with performance optimization.
 * @param params - The invitations to evaluate (emails and roles).
 */
async function evaluateInvitationsPolicies(
  params: z.infer<typeof InviteMembersSchema> & { accountSlug: string },
  user: JWTUserData,
) {
  const evaluator = createInvitationsPolicyEvaluator();
  const hasPolicies = await evaluator.hasPoliciesForStage('submission');

  // No policies to evaluate, skip
  if (!hasPolicies) {
    return {
      allowed: true,
      reasons: [],
    };
  }

  const builder = createInvitationContextBuilder();
  const context = await builder.buildContext(params, user);

  return evaluator.canInvite(context, 'submission');
}
