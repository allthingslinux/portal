import { useState, useTransition } from "react";
import { If } from "~/components/portal/if";
import { Trans } from "~/components/portal/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

import { removeMemberFromAccountAction } from "../../server/actions/team-members-server-actions";

export function RemoveMemberDialog({
  teamAccountId,
  userId,
  children,
}: React.PropsWithChildren<{
  teamAccountId: string;
  userId: string;
}>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey="teamS:removeMemberModalHeading" />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey={"teams:removeMemberModalDescription"} />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <RemoveMemberForm accountId={teamAccountId} userId={userId} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RemoveMemberForm({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}) {
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onMemberRemoved = () => {
    startTransition(async () => {
      try {
        await removeMemberFromAccountAction({ accountId, userId });
      } catch {
        setError(true);
      }
    });
  };

  return (
    <form action={onMemberRemoved}>
      <div className={"flex flex-col space-y-6"}>
        <p className={"text-muted-foreground text-sm"}>
          <Trans i18nKey={"common:modalConfirmationQuestion"} />
        </p>

        <If condition={error}>
          <RemoveMemberErrorAlert />
        </If>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={"common:cancel"} />
          </AlertDialogCancel>

          <Button
            data-test={"confirm-remove-member"}
            disabled={isSubmitting}
            variant={"destructive"}
          >
            <Trans i18nKey={"teams:removeMemberSubmitLabel"} />
          </Button>
        </AlertDialogFooter>
      </div>
    </form>
  );
}

function RemoveMemberErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <AlertTitle>
        <Trans i18nKey={"teams:removeMemberErrorHeading"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"teams:removeMemberErrorMessage"} />
      </AlertDescription>
    </Alert>
  );
}
