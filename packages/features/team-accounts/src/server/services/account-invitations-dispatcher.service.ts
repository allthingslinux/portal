import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { getLogger } from '@portal/shared/logger';
import { Database, Tables } from '@portal/supabase/database';

type Invitation = Tables<'invitations'>;

const invitePath = '/join';
const authTokenCallbackPath = '/auth/confirm';

const siteURL = process.env.NEXT_PUBLIC_SITE_URL;
const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? '';
const emailSender = process.env.EMAIL_SENDER;

const env = z
  .object({
    invitePath: z
      .string({
        required_error: 'The property invitePath is required',
      })
      .min(1),
    siteURL: z
      .string({
        required_error: 'NEXT_PUBLIC_SITE_URL is required',
      })
      .min(1),
    productName: z
      .string({
        required_error: 'NEXT_PUBLIC_PRODUCT_NAME is required',
      })
      .min(1),
    emailSender: z
      .string({
        required_error: 'EMAIL_SENDER is required',
      })
      .min(1),
  })
  .parse({
    invitePath,
    siteURL,
    productName,
    emailSender,
  });

export function createAccountInvitationsDispatchService(
  client: SupabaseClient<Database>,
) {
  return new AccountInvitationsDispatchService(client);
}

class AccountInvitationsDispatchService {
  private namespace = 'accounts.invitations.webhook';

  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  /**
   * @name sendInvitationEmail
   * @description Sends an invitation email to the invited user
   * @param invitation - The invitation to send
   * @returns
   */
  async sendInvitationEmail({
    invitation,
    link,
  }: {
    invitation: Invitation;
    link: string;
  }) {
    const logger = await getLogger();

    logger.info(
      {
        invitationId: invitation.id,
        name: this.namespace,
      },
      'Handling invitation email dispatch...',
    );

    // retrieve the inviter details
    const inviter = await this.getInviterDetails(invitation);

    if (inviter.error) {
      logger.error(
        {
          error: inviter.error,
          name: this.namespace,
        },
        'Failed to fetch inviter details',
      );

      throw inviter.error;
    }

    // retrieve the team details
    const team = await this.getTeamDetails(invitation.account_id);

    if (team.error) {
      logger.error(
        {
          error: team.error,
          name: this.namespace,
        },
        'Failed to fetch team details',
      );

      throw team.error;
    }

    const ctx = {
      invitationId: invitation.id,
      name: this.namespace,
    };

    try {
      logger.info(ctx, 'Invite retrieved. Sending invitation email...');

      // send the invitation email
      await this.sendEmail({
        invitation,
        link,
        inviter: inviter.data,
        team: team.data,
      });

      return {
        success: true,
      };
    } catch (error) {
      logger.warn({ error, ...ctx }, 'Failed to invite user to team');

      return {
        error,
        success: false,
      };
    }
  }

  /**
   * @name getInvitationLink
   * @description Generates an invitation link for the given token and email
   * @param token - The token to use for the invitation
   */
  getInvitationLink(token: string) {
    const siteUrl = env.siteURL;
    const url = new URL(env.invitePath, siteUrl);

    url.searchParams.set('invite_token', token);

    return url.href;
  }

  /**
   * @name sendEmail
   * @description Sends an invitation email to the invited user
   * @param invitation - The invitation to send
   * @param link - The link to the invitation
   * @param inviter - The inviter details
   * @param team - The team details
   * @returns
   */
  private async sendEmail({
    invitation,
    link,
    inviter,
    team,
  }: {
    invitation: Invitation;
    link: string;
    inviter: { name: string; email: string | null };
    team: { name: string };
  }) {
    const logger = await getLogger();

    const ctx = {
      invitationId: invitation.id,
      name: this.namespace,
    };

    const { renderInviteEmail } = await import('@portal/email-templates');
    const { getMailer } = await import('@portal/mailers');

    const mailer = await getMailer();

    const { html, subject } = await renderInviteEmail({
      link,
      invitedUserEmail: invitation.email,
      inviter: inviter.name ?? inviter.email ?? '',
      productName: env.productName,
      teamName: team.name,
    });

    return mailer
      .sendEmail({
        from: env.emailSender,
        to: invitation.email,
        subject,
        html,
      })
      .then(() => {
        logger.info(ctx, 'Invitation email successfully sent!');
      })
      .catch((error) => {
        console.error(error);

        logger.error({ error, ...ctx }, 'Failed to send invitation email');
      });
  }

  /**
   * @name getAuthCallbackUrl
   * @description Generates an auth token callback url. This redirects the user to a page where the user can sign in with a token.
   * @param nextLink - The next link to redirect the user to

   * @returns
   */
  getAuthCallbackUrl(nextLink: string) {
    const url = new URL(authTokenCallbackPath, env.siteURL);

    url.searchParams.set('next', nextLink);

    return url;
  }

  /**
   * @name getInviterDetails
   * @description Fetches the inviter details for the given invitation
   * @param invitation
   * @returns
   */
  private getInviterDetails(invitation: Invitation) {
    return this.adminClient
      .from('accounts')
      .select('email, name')
      .eq('id', invitation.invited_by)
      .single();
  }

  /**
   * @name getTeamDetails
   * @description Fetches the team details for the given account ID
   * @param accountId
   * @returns
   */
  private getTeamDetails(accountId: string) {
    return this.adminClient
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .single();
  }
}
