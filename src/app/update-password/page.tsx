import { AppLogo } from "~/components/app-logo";
import pathsConfig from "~/config/paths.config";
import { requireUser } from "~/core/database/require-user";
import { UpdatePasswordForm } from "~/features/auth/password-reset";
import { AuthLayoutShell } from "~/features/auth/shared";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t("auth:updatePassword"),
  };
};

const Logo = () => <AppLogo href={""} />;

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    callback?: string;
  }>;
};

async function UpdatePasswordPage(props: UpdatePasswordPageProps) {
  await requireUser({
    next: pathsConfig.auth.passwordUpdate,
  });

  const { callback } = await props.searchParams;
  const redirectTo = callback ?? pathsConfig.app.home;

  return (
    <AuthLayoutShell Logo={Logo}>
      <UpdatePasswordForm redirectTo={redirectTo} />
    </AuthLayoutShell>
  );
}

export default withI18n(UpdatePasswordPage);
