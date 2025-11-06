'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import { Input } from '~/components/ui/input';

import { reactivateUserAction } from '../lib/server/admin-server-actions';
import { ReactivateUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminReactivateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate User</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to reactivate this user?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ReactivateUserForm userId={props.userId} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ReactivateUserForm(props: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(ReactivateUserSchema),
    defaultValues: {
      userId: props.userId,
      confirmation: '',
    },
  });

  return (
    <Form {...form}>
      <form
        data-test={'admin-reactivate-user-form'}
        className={'flex flex-col space-y-8'}
        onSubmit={form.handleSubmit((data) => {
          startTransition(async () => {
            try {
              await reactivateUserAction(data);
            } catch {
              setError(true);
            }
          });
        })}
      >
        <If condition={error}>
          <Alert variant={'destructive'}>
            <AlertTitle>Error</AlertTitle>

            <AlertDescription>
              There was an error reactivating the user. Please check the server
              logs to see what went wrong.
            </AlertDescription>
          </Alert>
        </If>

        <FormField
          name={'confirmation'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Type <b>CONFIRM</b> to confirm
              </FormLabel>

              <FormControl>
                <Input
                  required
                  pattern={'CONFIRM'}
                  placeholder={'Type CONFIRM to confirm'}
                  {...field}
                />
              </FormControl>

              <FormDescription>
                Are you sure you want to do this?
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>

          <Button disabled={pending} type={'submit'}>
            {pending ? 'Reactivating...' : 'Reactivate User'}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}
