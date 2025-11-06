'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Trans } from '~/components/makerkit/trans';

import { DialogErrorAlert } from '~/shared/components/ui/dialog-error-alert';
import { useDialogForm } from '~/shared/hooks/use-dialog-form';

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
  const form = useForm<z.infer<typeof CreateTeamSchema>>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(CreateTeamSchema),
  });

  const { error, pending, handleSubmit } = useDialogForm(
    createTeamAccountAction,
    {
      onSuccess: props.onClose,
    }
  );

  return (
    <Form {...form}>
      <form
        data-test={'create-team-form'}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className={'flex flex-col space-y-4'}>
          <DialogErrorAlert
            error={error}
            titleKey="teams:createTeamErrorHeading"
            descriptionKey="teams:createTeamErrorMessage"
          />

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

