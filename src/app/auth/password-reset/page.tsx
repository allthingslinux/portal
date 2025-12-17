import type { Metadata } from "next";
import Link from "next/link";
import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import pathsConfig from "~/config/paths.config";
import { PasswordResetRequestContainer } from "~/features/auth/password-reset";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await createI18nServerInstance();

  return {
    title: t("auth:passwordResetLabel"),
  };
};

const { callback, passwordUpdate, signIn } = pathsConfig.auth;
const redirectPath = `${callback}?next=${passwordUpdate}`;

function PasswordResetPage() {
  return (
    <>
      <div className={"flex flex-col items-center gap-1"}>
        <Heading className={"tracking-tight"} level={4}>
          <Trans i18nKey={"auth:passwordResetLabel"} />
        </Heading>

        <p className={"text-muted-foreground text-sm"}>
          <Trans i18nKey={"auth:passwordResetSubheading"} />
        </p>
      </div>

      <div className={"flex flex-col space-y-4"}>
        <PasswordResetRequestContainer redirectPath={redirectPath} />

        <div className={"flex justify-center text-xs"}>
          <Button asChild size={"sm"} variant={"link"}>
            <Link href={signIn}>
              <Trans i18nKey={"auth:passwordRecoveredQuestion"} />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export default withI18n(PasswordResetPage);
