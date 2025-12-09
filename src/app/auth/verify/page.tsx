import { redirect } from "next/navigation";
import pathsConfig from "~/config/paths.config";
import { getServerSession } from "~/core/auth/better-auth/session";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

type Props = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t("auth:signIn"),
  };
};

async function VerifyPage(props: Props) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(pathsConfig.auth.signIn);
    return null;
  }

  // MFA is not implemented - redirect to home
  const nextPath = (await props.searchParams).next;
  const redirectPath = nextPath ?? pathsConfig.app.home;

  redirect(redirectPath);
  return null;
}

export default withI18n(VerifyPage);
