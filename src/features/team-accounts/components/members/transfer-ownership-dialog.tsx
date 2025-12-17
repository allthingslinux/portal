"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { Form } from "~/components/ui/form";

import { TransferOwnershipConfirmationSchema } from "../../schema/transfer-ownership-confirmation.schema";
import { transferOwnershipAction } from "../../server/actions/team-members-server-actions";

export function TransferOwnershipDialog({
  children,
  targetDisplayName,
  accountId,
  userId,
}: {
  children: React.ReactNode;
  accountId: string;
  userId: string;
  targetDisplayName: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey="team:transferOwnership" />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey="team:transferOwnershipDescription" />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <TransferOrganizationOwnershipForm
          accountId={accountId}
          targetDisplayName={targetDisplayName}
          userId={userId}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TransferOrganizationOwnershipForm({
  accountId,
  userId,
  targetDisplayName,
}: {
  userId: string;
  accountId: string;
  targetDisplayName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const form = useForm<{
    accountId: string;
    userId: string;
    otp?: string;
  }>({
    resolver: zodResolver(TransferOwnershipConfirmationSchema),
    defaultValues: {
      accountId,
      userId,
      otp: "", // OTP is now optional
    },
  });

  return (
    <Form {...form}>
      <form
        className={"flex flex-col space-y-4 text-sm"}
        onSubmit={form.handleSubmit((data) => {
          startTransition(async () => {
            try {
              await transferOwnershipAction(data);
            } catch {
              setError(true);
            }
          });
        })}
      >
        <If condition={error}>
          <TransferOwnershipErrorAlert />
        </If>

        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive text-sm">
            <Trans
              components={{ b: <b /> }}
              i18nKey={"teams:transferOwnershipDisclaimer"}
              values={{
                member: targetDisplayName,
              }}
            />
          </p>
        </div>

        <input name="otp" type="hidden" value="" />
        <Alert variant={"warning"}>
          <AlertTitle>
            <Trans i18nKey={"teams:transferOwnershipWarning"} />
          </AlertTitle>
          <AlertDescription>
            <Trans i18nKey={"teams:transferOwnershipWarningDescription"} />
          </AlertDescription>
        </Alert>

        <div>
          <p className={"text-muted-foreground"}>
            <Trans i18nKey={"common:modalConfirmationQuestion"} />
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={"common:cancel"} />
          </AlertDialogCancel>

          <Button
            data-test={"confirm-transfer-ownership-button"}
            disabled={pending}
            type={"submit"}
            variant={"destructive"}
          >
            <If
              condition={pending}
              fallback={<Trans i18nKey={"teams:transferOwnership"} />}
            >
              <Trans i18nKey={"teams:transferringOwnership"} />
            </If>
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}

function TransferOwnershipErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <AlertTitle>
        <Trans i18nKey={"teams:transferTeamErrorHeading"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"teams:transferTeamErrorMessage"} />
      </AlertDescription>
    </Alert>
  );
}
