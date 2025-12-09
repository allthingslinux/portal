import { useState, useTransition } from "react";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

import { deleteInvitationAction } from "../../server/actions/team-invitations-server-actions";

export function DeleteInvitationDialog({
  isOpen,
  setIsOpen,
  invitationId,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  invitationId: number;
}) {
  return (
    <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey="team:deleteInvitation" />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey="team:deleteInvitationDialogDescription" />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <DeleteInvitationForm
          invitationId={invitationId}
          setIsOpen={setIsOpen}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteInvitationForm({
  invitationId,
  setIsOpen,
}: {
  invitationId: number;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onInvitationRemoved = () => {
    startTransition(async () => {
      try {
        await deleteInvitationAction({ invitationId });

        setIsOpen(false);
      } catch {
        setError(true);
      }
    });
  };

  return (
    <form action={onInvitationRemoved} data-test={"delete-invitation-form"}>
      <div className={"flex flex-col space-y-6"}>
        <p className={"text-muted-foreground text-sm"}>
          <Trans i18nKey={"common:modalConfirmationQuestion"} />
        </p>

        <If condition={error}>
          <RemoveInvitationErrorAlert />
        </If>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={"common:cancel"} />
          </AlertDialogCancel>

          <Button
            disabled={isSubmitting}
            type={"submit"}
            variant={"destructive"}
          >
            <Trans i18nKey={"teams:deleteInvitation"} />
          </Button>
        </AlertDialogFooter>
      </div>
    </form>
  );
}

function RemoveInvitationErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <AlertTitle>
        <Trans i18nKey={"teams:deleteInvitationErrorTitle"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"teams:deleteInvitationErrorMessage"} />
      </AlertDescription>
    </Alert>
  );
}
