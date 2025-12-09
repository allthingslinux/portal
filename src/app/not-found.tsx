import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "~/(marketing)/_components/site-header";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { requireUser } from "~/core/database/supabase/require-user";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("common:notFound");

  return {
    title,
  };
};

const NotFoundPage = async () => {
  const user = await requireUser();

  return (
    <div className={"flex h-screen flex-1 flex-col"}>
      <SiteHeader user={user.data} />

      <div
        className={
          "container m-auto flex w-full flex-1 flex-col items-center justify-center"
        }
      >
        <div className={"flex flex-col items-center space-y-12"}>
          <div>
            <h1 className={"font-extrabold font-heading text-8xl xl:text-9xl"}>
              <Trans i18nKey={"common:pageNotFoundHeading"} />
            </h1>
          </div>

          <div className={"flex flex-col items-center space-y-8"}>
            <div className={"flex flex-col items-center space-y-2.5"}>
              <div>
                <Heading level={1}>
                  <Trans i18nKey={"common:pageNotFound"} />
                </Heading>
              </div>

              <p className={"text-muted-foreground"}>
                <Trans i18nKey={"common:pageNotFoundSubHeading"} />
              </p>
            </div>

            <Button asChild variant={"outline"}>
              <Link href={"/"}>
                <ArrowLeft className={"mr-2 h-4"} />

                <Trans i18nKey={"common:backToHomePage"} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withI18n(NotFoundPage);
