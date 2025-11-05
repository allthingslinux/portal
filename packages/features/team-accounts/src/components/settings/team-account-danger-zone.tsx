'use client';

import { useFormStatus } from 'react-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { ErrorBoundary } from '@portal/monitoring/components';
import { VerifyOtpForm } from '@portal/otp/components';
import { useUser } from '@portal/supabase/hooks/use-user';
import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@portal/ui/alert-dialog';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@portal/ui/form';
import { Input } from '@portal/ui/input';
import { LoadingOverlay } from '@portal/ui/loading-overlay';
import { Trans } from '@portal/ui/trans';

import { deleteTeamAccountAction } from '../../server/actions/delete-team-account-server-actions';
import { leaveTeamAccountAction } from '../../server/actions/leave-team-account-server-actions';

export function TeamAccountDangerZone({
  account,
  primaryOwnerUserId,
  features,
}: React.PropsWithChildren<{
  account: {
    name: string;
    id: string;
  };

  features: {
    enableTeamDeletion: boolean;
  };

  primaryOwnerUserId: string;
}>) {
  const { data: user } = useUser();

  if (!user) {
    return <LoadingOverlay fullPage={false} />;
  }

  // Only the primary owner can delete the team account
  const userIsPrimaryOwner = user.id === primaryOwnerUserId;

  if (userIsPrimaryOwner) {
    if (features.enableTeamDeletion) {
      return (
        <DangerZoneCard>
          <DeleteTeamContainer account={account} />
        </DangerZoneCard>
      );
    }

    return;
  }

  // A primary owner can't leave the team account
  // but other members can
  return (
    <DangerZoneCard>
      <LeaveTeamContainer account={account} />
    </DangerZoneCard>
  );
}

function DeleteTeamContainer(props: {
  account: {
    name: string;
    id: string;
  };
}) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm font-medium'}>
          <Trans i18nKey={'teams:deleteTeam'} />
        </span>

        <p className={'text-muted-foreground text-sm'}>
          <Trans
            i18nKey={'teams:deleteTeamDescription'}
            values={{
              teamName: props.account.name,
            }}
          />
        </p>
      </div>

      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-test={'delete-team-trigger'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'teams:deleteTeam'} />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Trans i18nKey={'teams:deletingTeam'} />
              </AlertDialogTitle>

              <AlertDialogDescription>
                <Trans
                  i18nKey={'teams:deletingTeamDescription'}
                  values={{
                    teamName: props.account.name,
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>

            <DeleteTeamConfirmationForm
              name={props.account.name}
              id={props.account.id}
            />
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function DeleteTeamConfirmationForm({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { data: user } = useUser();

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(
      z.object({
        otp: z.string().min(6).max(6),
      }),
    ),
    defaultValues: {
      otp: '',
    },
  });

  const { otp } = useWatch({ control: form.control });

  if (!user?.email) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!otp) {
    return (
      <VerifyOtpForm
        purpose={`delete-team-account-${id}`}
        email={user.email}
        onSuccess={(otp) => form.setValue('otp', otp, { shouldValidate: true })}
        CancelButton={
          <AlertDialogCancel className={'m-0'}>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>
        }
      />
    );
  }

  return (
    <ErrorBoundary fallback={<DeleteTeamErrorAlert />}>
      <Form {...form}>
        <form
          data-test={'delete-team-form'}
          className={'flex flex-col space-y-4'}
          action={deleteTeamAccountAction}
        >
          <div className={'flex flex-col space-y-2'}>
            <div
              className={
                'border-destructive text-destructive my-4 flex flex-col space-y-2 rounded-md border-2 p-4 text-sm'
              }
            >
              <div>
                <Trans
                  i18nKey={'teams:deleteTeamDisclaimer'}
                  values={{
                    teamName: name,
                  }}
                />
              </div>

              <div className={'text-sm'}>
                <Trans i18nKey={'common:modalConfirmationQuestion'} />
              </div>
            </div>

            <input type="hidden" value={id} name={'accountId'} />
            <input type="hidden" value={otp} name={'otp'} />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey={'common:cancel'} />
            </AlertDialogCancel>

            <DeleteTeamSubmitButton />
          </AlertDialogFooter>
        </form>
      </Form>
    </ErrorBoundary>
  );
}

function DeleteTeamSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={'delete-team-form-confirm-button'}
      disabled={pending}
      variant={'destructive'}
    >
      <Trans i18nKey={'teams:deleteTeam'} />
    </Button>
  );
}

function LeaveTeamContainer(props: {
  account: {
    name: string;
    id: string;
  };
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        confirmation: z.string().refine((value) => value === 'LEAVE', {
          message: 'Confirmation required to leave team',
          path: ['confirmation'],
        }),
      }),
    ),
    defaultValues: {
      confirmation: '' as 'LEAVE',
    },
  });

  return (
    <div className={'flex flex-col space-y-4'}>
      <p className={'text-muted-foreground text-sm'}>
        <Trans
          i18nKey={'teams:leaveTeamDescription'}
          values={{
            teamName: props.account.name,
          }}
        />
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div>
            <Button
              data-test={'leave-team-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'teams:leaveTeam'} />
            </Button>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans i18nKey={'teams:leavingTeamModalHeading'} />
            </AlertDialogTitle>

            <AlertDialogDescription>
              <Trans i18nKey={'teams:leavingTeamModalDescription'} />
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ErrorBoundary fallback={<LeaveTeamErrorAlert />}>
            <Form {...form}>
              <form
                className={'flex flex-col space-y-4'}
                action={leaveTeamAccountAction}
              >
                <input
                  type={'hidden'}
                  value={props.account.id}
                  name={'accountId'}
                />

                <FormField
                  name={'confirmation'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey={'teams:leaveTeamInputLabel'} />
                        </FormLabel>

                        <FormControl>
                          <Input
                            data-test="leave-team-input-field"
                            type="text"
                            className="w-full"
                            autoComplete={'off'}
                            placeholder=""
                            pattern="LEAVE"
                            required
                            {...field}
                          />
                        </FormControl>

                        <FormDescription>
                          <Trans i18nKey={'teams:leaveTeamInputDescription'} />
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Trans i18nKey={'common:cancel'} />
                  </AlertDialogCancel>

                  <LeaveTeamSubmitButton />
                </AlertDialogFooter>
              </form>
            </Form>
          </ErrorBoundary>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LeaveTeamSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={'confirm-leave-organization-button'}
      disabled={pending}
      variant={'destructive'}
    >
      <Trans i18nKey={'teams:leaveTeam'} />
    </Button>
  );
}

function LeaveTeamErrorAlert() {
  return (
    <div className={'flex flex-col space-y-4'}>
      <Alert variant={'destructive'}>
        <AlertTitle>
          <Trans i18nKey={'teams:leaveTeamErrorHeading'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={'common:genericError'} />
        </AlertDescription>
      </Alert>

      <AlertDialogFooter>
        <AlertDialogCancel>
          <Trans i18nKey={'common:cancel'} />
        </AlertDialogCancel>
      </AlertDialogFooter>
    </div>
  );
}

function DeleteTeamErrorAlert() {
  return (
    <div className={'flex flex-col space-y-4'}>
      <Alert variant={'destructive'}>
        <AlertTitle>
          <Trans i18nKey={'teams:deleteTeamErrorHeading'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={'common:genericError'} />
        </AlertDescription>
      </Alert>

      <AlertDialogFooter>
        <AlertDialogCancel>
          <Trans i18nKey={'common:cancel'} />
        </AlertDialogCancel>
      </AlertDialogFooter>
    </div>
  );
}

function DangerZoneCard({ children }: React.PropsWithChildren) {
  return (
    <Card className={'border-destructive border'}>
      <CardHeader>
        <CardTitle>
          <Trans i18nKey={'teams:settings.dangerZone'} />
        </CardTitle>

        <CardDescription>
          <Trans i18nKey={'teams:settings.dangerZoneDescription'} />
        </CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}
