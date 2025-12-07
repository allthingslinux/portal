'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { useSession } from '~/core/auth/nextauth/hooks';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import { Trans } from '~/components/makerkit/trans';

import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';
import { transferOwnershipAction } from '../../server/actions/team-members-server-actions';

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
          userId={userId}
          targetDisplayName={targetDisplayName}
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
  const { data: user } = useSession();

  const form = useForm<{
    accountId: string;
    userId: string;
    otp?: string;
  }>({
    resolver: zodResolver(TransferOwnershipConfirmationSchema),
    defaultValues: {
      accountId,
      userId,
      otp: '', // OTP is now optional
    },
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4 text-sm'}
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

        <div className="border-destructive rounded-md border p-4">
          <p className="text-destructive text-sm">
            <Trans
              i18nKey={'teams:transferOwnershipDisclaimer'}
              values={{
                member: targetDisplayName,
              }}
              components={{ b: <b /> }}
            />
          </p>
        </div>

        <input type="hidden" name="otp" value="" />
        <Alert variant={'warning'}>
          <AlertTitle>
            <Trans i18nKey={'teams:transferOwnershipWarning'} />
          </AlertTitle>
          <AlertDescription>
            <Trans i18nKey={'teams:transferOwnershipWarningDescription'} />
          </AlertDescription>
        </Alert>

        <div>
          <p className={'text-muted-foreground'}>
            <Trans i18nKey={'common:modalConfirmationQuestion'} />
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>

          <Button
            type={'submit'}
            data-test={'confirm-transfer-ownership-button'}
            variant={'destructive'}
            disabled={pending}
          >
            <If
              condition={pending}
              fallback={<Trans i18nKey={'teams:transferOwnership'} />}
            >
              <Trans i18nKey={'teams:transferringOwnership'} />
            </If>
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}

function TransferOwnershipErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:transferTeamErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'teams:transferTeamErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
