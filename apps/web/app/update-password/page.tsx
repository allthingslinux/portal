import { redirect } from 'next/navigation';

import { UpdatePasswordForm } from '@portal/auth/password-reset';
import { AuthLayoutShell } from '@portal/auth/shared';
import { requireUser } from '@portal/supabase/require-user';
import { getSupabaseServerClient } from '@portal/supabase/server-client';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('auth:updatePassword'),
  };
};

const Logo = () => <AppLogo href={''} />;

interface UpdatePasswordPageProps {
  searchParams: Promise<{
    callback?: string;
  }>;
}

async function UpdatePasswordPage(props: UpdatePasswordPageProps) {
  const client = getSupabaseServerClient();

  const result = await requireUser(client, {
    next: pathsConfig.auth.passwordUpdate,
  });

  if (result.error) {
    return redirect(result.redirectTo);
  }

  const { callback } = await props.searchParams;
  const redirectTo = callback ?? pathsConfig.app.home;

  return (
    <AuthLayoutShell Logo={Logo}>
      <UpdatePasswordForm redirectTo={redirectTo} />
    </AuthLayoutShell>
  );
}

export default withI18n(UpdatePasswordPage);
