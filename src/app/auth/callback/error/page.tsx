import Link from "next/link";
import { Trans } from "~/components/makerkit/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import pathsConfig from "~/config/paths.config";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

type AuthCallbackErrorPageProps = {
  searchParams: Promise<{
    error: string;
    callback?: string;
    email?: string;
  }>;
};

async function AuthCallbackErrorPage(props: AuthCallbackErrorPageProps) {
  const { error, callback } = await props.searchParams;
  const signInPath = pathsConfig.auth.signIn;
  const redirectPath = callback ?? pathsConfig.auth.callback;

  return (
    <div className={"flex flex-col space-y-4 py-4"}>
      <Alert variant={"warning"}>
        <AlertTitle>
          <Trans i18nKey={"auth:authenticationErrorAlertHeading"} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={error ?? "auth:authenticationErrorAlertBody"} />
        </AlertDescription>
      </Alert>

      <AuthCallbackForm redirectPath={redirectPath} signInPath={signInPath} />
    </div>
  );
}

function AuthCallbackForm(props: {
  signInPath: string;
  redirectPath?: string;
}) {
  return <SignInButton signInPath={props.signInPath} />;
}

function SignInButton(props: { signInPath: string }) {
  return (
    <Button asChild className={"w-full"}>
      <Link href={props.signInPath}>
        <Trans i18nKey={"auth:signIn"} />
      </Link>
    </Button>
  );
}

export default withI18n(AuthCallbackErrorPage);
