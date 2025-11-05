import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { AuthLayoutShell } from '@portal/auth/shared';
import { MultiFactorAuthError, requireUser } from '@portal/supabase/require-user';
import { getSupabaseServerAdminClient } from '@portal/supabase/server-admin-client';
import { getSupabaseServerClient } from '@portal/supabase/server-client';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { accountsMemberships } from '@portal/supabase/drizzle-schema';
import { eq, and } from 'drizzle-orm';
import { createTeamAccountsApiDrizzle } from '@portal/team-accounts/api.drizzle';
import { AcceptInvitationContainer } from '@portal/team-accounts/components';
import { Button } from '@portal/ui/button';
import { Heading } from '@portal/ui/heading';
import { Trans } from '@portal/ui/trans';

import { AppLogo } from '~/components/app-logo';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

interface JoinTeamAccountPageProps {
  searchParams: Promise<{
    invite_token?: string;
    type?: 'invite' | 'magic-link';
    email?: string;
  }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('teams:joinTeamAccount'),
  };
};

async function JoinTeamAccountPage(props: JoinTeamAccountPageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.invite_token;

  // no token, redirect to 404
  if (!token) {
    notFound();
  }

  const client = getSupabaseServerClient();
  const auth = await requireUser(client);

  // if the user is not logged in or there is an error
  // redirect to the sign up page with the invite token
  // so that they will get back to this page after signing up
  if (auth.error ?? !auth.data) {
    if (auth.error instanceof MultiFactorAuthError) {
      const urlParams = new URLSearchParams({
        next: `${pathsConfig.app.joinTeam}?invite_token=${token}&email=${searchParams.email ?? ''}`,
      });

      const verifyMfaUrl = `${pathsConfig.auth.verifyMfa}?${urlParams.toString()}`;

      // if the user needs to verify MFA
      // redirect them to the MFA verification page
      redirect(verifyMfaUrl);
    } else {
      const urlParams = new URLSearchParams({
        invite_token: token,
      });

      const nextUrl = `${pathsConfig.auth.signUp}?${urlParams.toString()}`;

      // redirect to the sign up page with the invite token
      redirect(nextUrl);
    }
  }

  // get api to interact with team accounts
  const adminClient = getSupabaseServerAdminClient();
  const api = createTeamAccountsApiDrizzle();

  // the user is logged in, we can now check if the token is valid
  const invitation = await api.getInvitation(adminClient, token);

  // the invitation is not found or expired or the email is not the same as the user's email
  const isInvitationValid = invitation?.email === auth.data.email;

  if (!isInvitationValid) {
    return (
      <AuthLayoutShell Logo={AppLogo}>
        <InviteNotFoundOrExpired />
      </AuthLayoutShell>
    );
  }

  // we need to verify the user isn't already in the account
  // we do so by checking if the user is already a member of the account
  const drizzleClient = await getDrizzleSupabaseClient();
  const membershipCheck = await drizzleClient.runTransaction(async (tx) => {
    return await tx
      .select()
      .from(accountsMemberships)
      .where(
        and(
          eq(accountsMemberships.accountId, invitation.account.id),
          eq(accountsMemberships.userId, user.id)
        )
      )
      .limit(1);
  });

  const isAlreadyTeamMember = membershipCheck.length > 0;

  // if the user is already in the account redirect to the home page
  if (isAlreadyTeamMember) {
    const { getLogger } = await import('@portal/shared/logger');
    const logger = await getLogger();

    logger.warn(
      {
        name: 'join-team-account',
        accountId: invitation.account.id,
        userId: auth.data.id,
      },
      'User is already in the account. Redirecting to account page.',
    );

    // if the user is already in the account redirect to the home page
    redirect(pathsConfig.app.home);
  }

  // if the user decides to sign in with a different account
  // we redirect them to the sign in page with the invite token
  const signOutNext = `${pathsConfig.auth.signIn}?invite_token=${token}`;

  // once the user accepts the invitation, we redirect them to the account home page
  const accountHome = pathsConfig.app.accountHome.replace(
    '[account]',
    invitation.account.slug,
  );

  // Determine if we should show the account setup step (Step 2)
  // Decision logic:
  // 1. Only show for new accounts (linkType === 'invite')
  // 2. Only if we have auth options available (password OR OAuth)
  // 3. Users can always skip and set up auth later in account settings
  const linkType = searchParams.type;
  const supportsPasswordSignUp = authConfig.providers.password;
  const supportsOAuthProviders = authConfig.providers.oAuth.length > 0;
  const isNewAccount = linkType === 'invite';

  const shouldSetupAccount =
    isNewAccount && (supportsPasswordSignUp || supportsOAuthProviders);

  // Determine redirect destination after joining:
  // - If shouldSetupAccount: redirect to /identities with next param (Step 2)
  // - Otherwise: redirect directly to team home (skip Step 2)
  const nextPath = shouldSetupAccount
    ? `/identities?next=${encodeURIComponent(accountHome)}`
    : accountHome;

  const email = auth.data.email ?? '';

  return (
    <AuthLayoutShell Logo={AppLogo}>
      <AcceptInvitationContainer
        email={email}
        inviteToken={token}
        invitation={invitation}
        paths={{
          signOutNext,
          nextPath,
        }}
      />
    </AuthLayoutShell>
  );
}

export default withI18n(JoinTeamAccountPage);

function InviteNotFoundOrExpired() {
  return (
    <div className={'flex flex-col space-y-4'}>
      <Heading level={6}>
        <Trans i18nKey={'teams:inviteNotFoundOrExpired'} />
      </Heading>

      <p className={'text-muted-foreground text-sm'}>
        <Trans i18nKey={'teams:inviteNotFoundOrExpiredDescription'} />
      </p>

      <Button asChild className={'w-full'} variant={'outline'}>
        <Link href={pathsConfig.app.home}>
          <ArrowLeft className={'mr-2 w-4'} />
          <Trans i18nKey={'teams:backToHome'} />
        </Link>
      </Button>
    </div>
  );
}
