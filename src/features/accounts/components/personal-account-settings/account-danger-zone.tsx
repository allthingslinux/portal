'use client';

import { useFormStatus } from 'react-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useForm, useWatch } from 'react-hook-form';

import { ErrorBoundary } from '~/core/monitoring/api/components/error-boundary';
import { useSession } from '~/core/auth/nextauth/hooks';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { Trans } from '~/components/makerkit/trans';

import { DeletePersonalAccountSchema } from '../../schema/delete-personal-account.schema';
import { deletePersonalAccountAction } from '../../server/personal-accounts-server-actions';

export function AccountDangerZone() {
  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm font-medium'}>
          <Trans i18nKey={'account:deleteAccount'} />
        </span>

        <p className={'text-muted-foreground text-sm'}>
          <Trans i18nKey={'account:deleteAccountDescription'} />
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
        <Button data-test={'delete-account-button'} variant={'destructive'}>
          <Trans i18nKey={'account:deleteAccount'} />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey={'account:deleteAccount'} />
          </AlertDialogTitle>
        </AlertDialogHeader>

        <ErrorBoundary fallback={<DeleteAccountErrorContainer />}>
          <DeleteAccountForm email={user.email} />
        </ErrorBoundary>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteAccountForm(props: { email: string }) {
  const form = useForm({
    resolver: zodResolver(DeletePersonalAccountSchema),
    defaultValues: {},
  });

  return (
    <Form {...form}>
      <form
        data-test={'delete-account-form'}
        action={deletePersonalAccountAction}
        className={'flex flex-col space-y-4'}
      >
        <input type="hidden" name="otp" value="" />

        <div className={'flex flex-col space-y-6'}>
          <div
            className={
              'border-destructive text-destructive rounded-md border p-4 text-sm'
            }
          >
            <div className={'flex flex-col space-y-2'}>
              <div>
                <Trans i18nKey={'account:deleteAccountDescription'} />
              </div>

              <div>
                <Trans i18nKey={'common:modalConfirmationQuestion'} />
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
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
      data-test={'confirm-delete-account-button'}
      type={'submit'}
      disabled={pending || props.disabled}
      name={'action'}
      variant={'destructive'}
    >
      {pending ? (
        <Trans i18nKey={'account:deletingAccount'} />
      ) : (
        <Trans i18nKey={'account:deleteAccount'} />
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
          <Trans i18nKey={'common:cancel'} />
        </AlertDialogCancel>
      </div>
    </div>
  );
}

function DeleteAccountErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:deleteAccountErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:genericError'} />
      </AlertDescription>
    </Alert>
  );
}
