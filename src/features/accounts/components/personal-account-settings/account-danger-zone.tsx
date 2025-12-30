"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { Trans } from "~/components/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ErrorBoundary } from "~/core/monitoring/api/components/error-boundary";
import { DeletePersonalAccountSchema } from "~/features/accounts/schema/delete-personal-account.schema";
import { deletePersonalAccountAction } from "~/features/accounts/server/personal-accounts-server-actions";
import { useSession } from "~/hooks/use-session";

export function AccountDangerZone() {
  return (
    <div className={"flex flex-col space-y-4"}>
      <div className={"flex flex-col space-y-1"}>
        <span className={"font-medium text-sm"}>
          <Trans i18nKey={"account:deleteAccount"} />
        </span>

        <p className={"text-muted-foreground text-sm"}>
          <Trans i18nKey={"account:deleteAccountDescription"} />
        </p>
      </div>

      <div>
        <DeleteAccountModal />
      </div>
    </div>
  );
}

function DeleteAccountModal() {
  const { data: user } = useSession();

  if (!user?.email) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button data-test={"delete-account-button"} variant={"destructive"}>
          <Trans i18nKey={"account:deleteAccount"} />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey={"account:deleteAccount"} />
          </AlertDialogTitle>
        </AlertDialogHeader>

        <ErrorBoundary fallback={<DeleteAccountErrorContainer />}>
          <DeleteAccountForm email={user.email} />
        </ErrorBoundary>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteAccountForm(_props: { email: string }) {
  const form = useForm({
    resolver: zodResolver(DeletePersonalAccountSchema),
    defaultValues: {},
  });

  return (
    <Form {...form}>
      <form
        action={deletePersonalAccountAction}
        className={"flex flex-col space-y-4"}
        data-test={"delete-account-form"}
      >
        <input name="otp" type="hidden" value="" />

        <div className={"flex flex-col space-y-6"}>
          <div
            className={
              "rounded-md border border-destructive p-4 text-destructive text-sm"
            }
          >
            <div className={"flex flex-col space-y-2"}>
              <div>
                <Trans i18nKey={"account:deleteAccountDescription"} />
              </div>

              <div>
                <Trans i18nKey={"common:modalConfirmationQuestion"} />
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={"common:cancel"} />
          </AlertDialogCancel>

          <DeleteAccountSubmitButton disabled={!form.formState.isValid} />
        </AlertDialogFooter>
      </form>
    </Form>
  );
}

function DeleteAccountSubmitButton(props: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={"confirm-delete-account-button"}
      disabled={pending || props.disabled}
      name={"action"}
      type={"submit"}
      variant={"destructive"}
    >
      {pending ? (
        <Trans i18nKey={"account:deletingAccount"} />
      ) : (
        <Trans i18nKey={"account:deleteAccount"} />
      )}
    </Button>
  );
}

function DeleteAccountErrorContainer() {
  return (
    <div className="flex flex-col gap-y-4">
      <DeleteAccountErrorAlert />

      <div>
        <AlertDialogCancel>
          <Trans i18nKey={"common:cancel"} />
        </AlertDialogCancel>
      </div>
    </div>
  );
}

function DeleteAccountErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <ExclamationTriangleIcon className={"h-4"} />

      <AlertTitle>
        <Trans i18nKey={"account:deleteAccountErrorHeading"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"common:genericError"} />
      </AlertDescription>
    </Alert>
  );
}
