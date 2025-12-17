import type { Metadata } from "next";
import Link from "next/link";
import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import authConfig from "~/config/auth.config";
import pathsConfig from "~/config/paths.config";
import { SignInMethodsContainer } from "~/features/auth/sign-in";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";
import { RedirectHandler } from "./redirect-handler";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export const generateMetadata = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t("auth:signIn"),
  };
};

async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;

  const returnPath = next || pathsConfig.app.home;

  // If password auth is disabled and only one OAuth provider is enabled,
  // redirect immediately (proxy should catch this, but client-side nav might bypass it)
  const shouldAutoRedirect =
    !authConfig.providers.password && authConfig.providers.oAuth.length === 1;

  if (shouldAutoRedirect) {
    const provider = authConfig.providers.oAuth[0];

    // Return client-side redirect component that runs immediately on mount
    // This handles both server-side and client-side navigation
    // Proxy should catch server-side, but client-side nav (Next.js Link) bypasses it
    // The component uses Better Auth's client API to make proper POST request
    return <RedirectHandler provider={provider} returnPath={returnPath} />;
  }

  const paths = {
    callback: pathsConfig.auth.callback,
    returnPath,
    joinTeam: pathsConfig.app.joinTeam,
  };

  return (
    <>
      <div className={"flex flex-col items-center gap-1"}>
        <Heading className={"tracking-tight"} level={4}>
          <Trans i18nKey={"auth:signInHeading"} />
        </Heading>

        <p className={"text-muted-foreground text-sm"}>
          <Trans i18nKey={"auth:signInSubheading"} />
        </p>
      </div>

      <SignInMethodsContainer
        captchaSiteKey={authConfig.captchaTokenSiteKey}
        paths={paths}
        providers={authConfig.providers}
      />

      <div className={"flex justify-center"}>
        <Button asChild size={"sm"} variant={"link"}>
          <Link href={pathsConfig.auth.signUp} prefetch={true}>
            <Trans i18nKey={"auth:doNotHaveAccountYet"} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignInPage);
