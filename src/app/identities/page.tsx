import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";
import { AppLogo } from "~/components/app-logo";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import authConfig from "~/config/auth.config";
import pathsConfig from "~/config/paths.config";
import { requireUser } from "~/core/database/supabase/require-user";
import type { Provider } from "~/core/database/supabase/supabase-types";
import { LinkAccountsList } from "~/features/accounts/components/personal-account-settings";
import { AuthLayoutShell } from "~/features/auth/shared";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export const meta = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t("auth:setupAccount"),
  };
};

type IdentitiesPageProps = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * @name IdentitiesPage
 * @description Displays linked accounts and available authentication methods.
 */
async function IdentitiesPage(props: IdentitiesPageProps) {
  const {
    nextPath,
    showPasswordOption,
    showEmailOption,
    oAuthProviders,
    enableIdentityLinking,
  } = await fetchData(props);

  return (
    <AuthLayoutShell
      contentClassName="max-w-md overflow-y-hidden"
      Logo={AppLogo}
    >
      <div
        className={
          "flex max-h-[70vh] w-full flex-col items-center space-y-6 overflow-y-auto"
        }
      >
        <div className={"flex flex-col items-center gap-1"}>
          <Heading className="text-center" level={4}>
            <Trans i18nKey={"auth:linkAccountToSignIn"} />
          </Heading>

          <Heading
            className={"text-center text-muted-foreground text-sm"}
            level={6}
          >
            <Trans i18nKey={"auth:linkAccountToSignInDescription"} />
          </Heading>
        </div>

        <IdentitiesStep
          enableIdentityLinking={enableIdentityLinking}
          nextPath={nextPath}
          oAuthProviders={oAuthProviders}
          showEmailOption={showEmailOption}
          showPasswordOption={showPasswordOption}
        />
      </div>
    </AuthLayoutShell>
  );
}

export default withI18n(IdentitiesPage);

/**
 * @name IdentitiesStep
 * @description Displays linked accounts and available authentication methods.
 * LinkAccountsList component handles all authentication options including OAuth and Email/Password.
 */
function IdentitiesStep(props: {
  nextPath: string;
  showPasswordOption: boolean;
  showEmailOption: boolean;
  enableIdentityLinking: boolean;
  oAuthProviders: Provider[];
}) {
  return (
    <div
      className={
        "fade-in slide-in-from-bottom-4 mx-auto flex w-full max-w-md animate-in flex-col space-y-4 duration-500"
      }
      data-test="join-step-two"
    >
      <LinkAccountsList
        enabled={props.enableIdentityLinking}
        providers={props.oAuthProviders}
        redirectTo={props.nextPath}
        showEmailOption={props.showEmailOption}
        showPasswordOption={props.showPasswordOption}
      />

      <Button asChild data-test="skip-identities-button">
        <Link href={props.nextPath}>
          <Trans i18nKey={"common:continueKey"} />
        </Link>
      </Button>
    </div>
  );
}

async function fetchData(props: IdentitiesPageProps) {
  const searchParams = await props.searchParams;
  const auth = await requireUser();

  // If not authenticated, redirect to sign in
  if (!auth.data) {
    throw redirect(pathsConfig.auth.signIn);
  }

  // Get the next path from URL params (where to redirect after setup)
  const nextPath = searchParams.next || pathsConfig.app.home;

  // Available auth methods to add
  const showPasswordOption = authConfig.providers.password;

  // Show email option if password sign-in is enabled
  const showEmailOption = authConfig.providers.password;

  const oAuthProviders = authConfig.providers.oAuth;
  const enableIdentityLinking = authConfig.enableIdentityLinking;

  return {
    nextPath,
    showPasswordOption,
    showEmailOption,
    oAuthProviders,
    enableIdentityLinking,
  };
}
