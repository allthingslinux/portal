import type { Metadata } from "next";
import { Trans } from "~/components/trans";
import { Heading } from "~/components/ui/heading";
import { SignInMethodsContainer } from "~/lib/auth/components/sign-in-methods-container";
import authConfig from "~/lib/config/auth.config";
import pathsConfig from "~/lib/config/paths.config";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

type SignInPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const generateMetadata = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();
  return { title: i18n.t("auth:signIn") };
};

async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;
  const returnPath = next || pathsConfig.app.home;

  // Auto-redirect if only one OAuth provider (this logic may need review)
  // Currently disabled as we have 3 providers configured
  // if (authConfig.providers.oAuth.length === 1) {
  //   return (
  //     <RedirectHandler
  //       provider={authConfig.providers.oAuth[0]}
  //       returnPath={returnPath}
  //     />
  //   );
  // }

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <Heading className="tracking-tight" level={4}>
          <Trans i18nKey="auth:signInHeading" />
        </Heading>
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="auth:signInSubheading" />
        </p>
      </div>

      <SignInMethodsContainer
        paths={{
          callback: pathsConfig.auth.callback,
          returnPath,
        }}
        providers={{ oAuth: [...authConfig.providers.oAuth] }}
      />
    </>
  );
}

export default withI18n(SignInPage);
