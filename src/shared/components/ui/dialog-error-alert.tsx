import { If } from "~/components/portal/if";
import { Trans } from "~/components/portal/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function DialogErrorAlert({
  error,
  titleKey = "common:operationFailed",
  descriptionKey = "common:genericError",
}: {
  error: boolean;
  titleKey?: string;
  descriptionKey?: string;
}) {
  return (
    <If condition={error}>
      <Alert variant={"destructive"}>
        <AlertTitle>
          <Trans i18nKey={titleKey} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={descriptionKey} />
        </AlertDescription>
      </Alert>
    </If>
  );
}
