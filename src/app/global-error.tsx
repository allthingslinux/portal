"use client";

import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "~/(marketing)/_components/site-header";
import { RootProviders } from "~/components/root-providers";
import { Trans } from "~/components/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { useCaptureException } from "~/hooks/use-capture-exception";
import { useSession } from "~/hooks/use-session";

const GlobalErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useCaptureException(error);

  return (
    <html lang="en">
      <body>
        <RootProviders>
          <GlobalErrorContent reset={reset} />
        </RootProviders>
      </body>
    </html>
  );
};

function GlobalErrorContent({ reset }: { reset: () => void }) {
  const { data: user } = useSession();

  return (
    <div className={"flex h-screen flex-1 flex-col"}>
      <SiteHeader user={user} />

      <div
        className={
          "container m-auto flex w-full flex-1 flex-col items-center justify-center"
        }
      >
        <div className={"flex flex-col items-center space-y-8"}>
          <div>
            <h1 className={"font-heading font-semibold text-9xl"}>
              <Trans i18nKey={"common:errorPageHeading"} />
            </h1>
          </div>

          <div className={"flex flex-col items-center space-y-8"}>
            <div
              className={
                "flex max-w-xl flex-col items-center gap-y-2 text-center"
              }
            >
              <div>
                <Heading level={2}>
                  <Trans i18nKey={"common:genericError"} />
                </Heading>
              </div>

              <p className={"text-lg text-muted-foreground"}>
                <Trans i18nKey={"common:genericErrorSubHeading"} />
              </p>
            </div>

            <div className={"flex space-x-4"}>
              <Button className={"w-full"} onClick={reset} variant={"default"}>
                <ArrowLeft className={"mr-2 h-4"} />

                <Trans i18nKey={"common:goBack"} />
              </Button>

              <Button asChild className={"w-full"} variant={"outline"}>
                <Link href={"/contact"}>
                  <MessageCircle className={"mr-2 h-4"} />

                  <Trans i18nKey={"common:contactUs"} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalErrorPage;
