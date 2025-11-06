import Link from 'next/link';

import { SignInMethodsContainer } from '~/features/auth/sign-in';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Trans } from '~/components/makerkit/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/shared/lib/i18n/i18n.server';
import { withI18n } from '~/shared/lib/i18n/with-i18n';

interface SignInPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signIn'),
  };
};

async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;

  const paths = {
    callback: pathsConfig.auth.callback,
    returnPath: next || pathsConfig.app.home,
    joinTeam: pathsConfig.app.joinTeam,
  };

  return (
    <>
      <div className={'flex flex-col items-center gap-1'}>
        <Heading level={4} className={'tracking-tight'}>
          <Trans i18nKey={'auth:signInHeading'} />
        </Heading>

        <p className={'text-muted-foreground text-sm'}>
          <Trans i18nKey={'auth:signInSubheading'} />
        </p>
      </div>

      <SignInMethodsContainer
        paths={paths}
        providers={authConfig.providers}
        captchaSiteKey={authConfig.captchaTokenSiteKey}
      />

      <div className={'flex justify-center'}>
        <Button asChild variant={'link'} size={'sm'}>
          <Link href={pathsConfig.auth.signUp} prefetch={true}>
            <Trans i18nKey={'auth:doNotHaveAccountYet'} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignInPage);
