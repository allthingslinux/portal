import { Metadata } from 'next';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { Provider } from '~/core/database/supabase/supabase-types';

import { LinkAccountsList } from '~/features/accounts/components/personal-account-settings';
import { AuthLayoutShell } from '~/features/auth/shared';
import { requireUser } from '~/core/database/supabase/require-user';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Trans } from '~/components/makerkit/trans';

import { AppLogo } from '~/components/app-logo';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/shared/lib/i18n/i18n.server';
import { withI18n } from '~/shared/lib/i18n/with-i18n';

export const meta = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:setupAccount'),
  };
};

type IdentitiesPageProps = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * @name IdentitiesPage
 * @description Displays linked accounts and available authentication methods.
 */
async function IdentitiesPage(props: IdentitiesPageProps) {
  const {
    nextPath,
    showPasswordOption,
    showEmailOption,
    oAuthProviders,
    enableIdentityLinking,
  } = await fetchData(props);

  return (
    <AuthLayoutShell
      Logo={AppLogo}
      contentClassName="max-w-md overflow-y-hidden"
    >
      <div
        className={
          'flex max-h-[70vh] w-full flex-col items-center space-y-6 overflow-y-auto'
        }
      >
        <div className={'flex flex-col items-center gap-1'}>
          <Heading level={4} className="text-center">
            <Trans i18nKey={'auth:linkAccountToSignIn'} />
          </Heading>

          <Heading
            level={6}
            className={'text-muted-foreground text-center text-sm'}
          >
            <Trans i18nKey={'auth:linkAccountToSignInDescription'} />
          </Heading>
        </div>

        <IdentitiesStep
          nextPath={nextPath}
          showPasswordOption={showPasswordOption}
          showEmailOption={showEmailOption}
          oAuthProviders={oAuthProviders}
          enableIdentityLinking={enableIdentityLinking}
        />
      </div>
    </AuthLayoutShell>
  );
}

export default withI18n(IdentitiesPage);

/**
 * @name IdentitiesStep
 * @description Displays linked accounts and available authentication methods.
 * LinkAccountsList component handles all authentication options including OAuth and Email/Password.
 */
function IdentitiesStep(props: {
  nextPath: string;
  showPasswordOption: boolean;
  showEmailOption: boolean;
  enableIdentityLinking: boolean;
  oAuthProviders: Provider[];
}) {
  return (
    <div
      className={
        'animate-in fade-in slide-in-from-bottom-4 mx-auto flex w-full max-w-md flex-col space-y-4 duration-500'
      }
      data-test="join-step-two"
    >
      <LinkAccountsList
        providers={props.oAuthProviders}
        showPasswordOption={props.showPasswordOption}
        showEmailOption={props.showEmailOption}
        redirectTo={props.nextPath}
        enabled={props.enableIdentityLinking}
      />

      <Button asChild data-test="skip-identities-button">
        <Link href={props.nextPath}>
          <Trans i18nKey={'common:continueKey'} />
        </Link>
      </Button>
    </div>
  );
}

async function fetchData(props: IdentitiesPageProps) {
  const searchParams = await props.searchParams;
  const auth = await requireUser();

  // If not authenticated, redirect to sign in
  if (!auth.data) {
    throw redirect(pathsConfig.auth.signIn);
  }

  // Get the next path from URL params (where to redirect after setup)
  const nextPath = searchParams.next || pathsConfig.app.home;

  // Available auth methods to add
  const showPasswordOption = authConfig.providers.password;

  // Show email option if password or magic link is enabled
  const showEmailOption =
    authConfig.providers.password ||
    authConfig.providers.magicLink;

  const oAuthProviders = authConfig.providers.oAuth;
  const enableIdentityLinking = authConfig.enableIdentityLinking;

  return {
    nextPath,
    showPasswordOption,
    showEmailOption,
    oAuthProviders,
    enableIdentityLinking,
  };
}
