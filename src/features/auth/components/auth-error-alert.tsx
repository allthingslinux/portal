import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Trans } from "~/components/portal/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

/**
 * @name AuthErrorAlert
 * @param error Authentication error code
 * This error is mapped from the translation auth:errors.{error}
 * To update the error messages, please update the translation file
 * @constructor
 */
export function AuthErrorAlert({
  error,
}: {
  error: Error | null | undefined | string;
}) {
  if (!error) {
    return null;
  }

  const DefaultError = <Trans i18nKey="auth:errors.default" />;
  const errorCode = error instanceof Error ? error.message : error;

  return (
    <Alert variant={"destructive"}>
      <ExclamationTriangleIcon className={"w-4"} />

      <AlertTitle>
        <Trans i18nKey={"auth:errorAlertHeading"} />
      </AlertTitle>

      <AlertDescription data-test={"auth-error-message"}>
        <Trans
          components={{ DefaultError }}
          defaults={"<DefaultError />"}
          i18nKey={`auth:errors.${errorCode}`}
        />
      </AlertDescription>
    </Alert>
  );
}
