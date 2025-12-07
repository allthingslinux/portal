import { redirect } from 'next/navigation';

import { getServerSession } from '~/core/auth/nextauth/session';

import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/shared/lib/i18n/i18n.server';
import { withI18n } from '~/shared/lib/i18n/with-i18n';

interface Props {
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

async function VerifyPage(props: Props) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(pathsConfig.auth.signIn);
  }

  // MFA is not implemented - redirect to home
  const nextPath = (await props.searchParams).next;
  const redirectPath = nextPath ?? pathsConfig.app.home;

  redirect(redirectPath);
}

export default withI18n(VerifyPage);
