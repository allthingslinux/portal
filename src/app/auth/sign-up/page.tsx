import type { Metadata } from "next";
import Link from "next/link";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import authConfig from "~/config/auth.config";
import pathsConfig from "~/config/paths.config";
import { SignUpMethodsContainer } from "~/features/auth/sign-up";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export const generateMetadata = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t("auth:signUp"),
  };
};

const paths = {
  callback: pathsConfig.auth.callback,
  appHome: pathsConfig.app.home,
};

async function SignUpPage() {
  return (
    <>
      <div className={"flex flex-col items-center gap-1"}>
        <Heading className={"tracking-tight"} level={4}>
          <Trans i18nKey={"auth:signUpHeading"} />
        </Heading>

        <p className={"text-muted-foreground text-sm"}>
          <Trans i18nKey={"auth:signUpSubheading"} />
        </p>
      </div>

      <SignUpMethodsContainer
        captchaSiteKey={authConfig.captchaTokenSiteKey}
        displayTermsCheckbox={authConfig.displayTermsCheckbox}
        paths={paths}
        providers={authConfig.providers}
      />

      <div className={"flex justify-center"}>
        <Button asChild size={"sm"} variant={"link"}>
          <Link href={pathsConfig.auth.signIn} prefetch={true}>
            <Trans i18nKey={"auth:alreadyHaveAnAccount"} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignUpPage);
