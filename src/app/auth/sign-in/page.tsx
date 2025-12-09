import Link from "next/link";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import authConfig from "~/config/auth.config";
import pathsConfig from "~/config/paths.config";
import { SignInMethodsContainer } from "~/features/auth/sign-in";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

type SignInPageProps = {
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

async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;

  const paths = {
    callback: pathsConfig.auth.callback,
    returnPath: next || pathsConfig.app.home,
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
