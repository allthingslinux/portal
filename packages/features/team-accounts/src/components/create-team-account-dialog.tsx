'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import { Button } from '@portal/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@portal/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@portal/ui/form';
import { If } from '@portal/ui/if';
import { Input } from '@portal/ui/input';
import { Trans } from '@portal/ui/trans';

import { CreateTeamSchema } from '../schema/create-team.schema';
import { createTeamAccountAction } from '../server/actions/create-team-account-server-actions';

export function CreateTeamAccountDialog(
  props: React.PropsWithChildren<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>,
) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'teams:createTeamModalHeading'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'teams:createTeamModalDescription'} />
          </DialogDescription>
        </DialogHeader>

        <CreateOrganizationAccountForm onClose={() => props.setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateOrganizationAccountForm(props: { onClose: () => void }) {
  const [error, setError] = useState<boolean>();
  const [pending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof CreateTeamSchema>>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(CreateTeamSchema),
  });

  return (
    <Form {...form}>
      <form
        data-test={'create-team-form'}
        onSubmit={form.handleSubmit((data) => {
          startTransition(async () => {
            try {
              const { error } = await createTeamAccountAction(data);

              if (error) {
                setError(true);
              }
            } catch (error) {
              if (!isRedirectError(error)) {
                setError(true);
              }
            }
          });
        })}
      >
        <div className={'flex flex-col space-y-4'}>
          <If condition={error}>
            <CreateOrganizationErrorAlert />
          </If>

          <FormField
            name={'name'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey={'teams:teamNameLabel'} />
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'create-team-name-input'}
                      required
                      minLength={2}
                      maxLength={50}
                      placeholder={''}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={'teams:teamNameDescription'} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className={'flex justify-end space-x-2'}>
            <Button
              variant={'outline'}
              type={'button'}
              disabled={pending}
              onClick={props.onClose}
            >
              <Trans i18nKey={'common:cancel'} />
            </Button>

            <Button data-test={'confirm-create-team-button'} disabled={pending}>
              {pending ? (
                <Trans i18nKey={'teams:creatingTeam'} />
              ) : (
                <Trans i18nKey={'teams:createTeamSubmitLabel'} />
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function CreateOrganizationErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:createTeamErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'teams:createTeamErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
