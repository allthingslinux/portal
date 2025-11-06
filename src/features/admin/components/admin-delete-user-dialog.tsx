'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

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

import { deleteUserAction } from '../lib/server/admin-server-actions';
import { DeleteUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminDeleteUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(DeleteUserSchema),
    defaultValues: {
      userId: props.userId,
      confirmation: '',
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete this user? All the data associated
            with this user will be permanently deleted. Any active subscriptions
            will be canceled.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            data-test={'admin-delete-user-form'}
            className={'flex flex-col space-y-8'}
            onSubmit={form.handleSubmit((data) => {
              startTransition(async () => {
                try {
                  await deleteUserAction(data);

                  setError(false);
                } catch {
                  if (isRedirectError(error)) {
                    // Do nothing
                  } else {
                    setError(true);
                  }
                }
              });
            })}
          >
            <If condition={error}>
              <Alert variant={'destructive'}>
                <AlertTitle>Error</AlertTitle>

                <AlertDescription>
                  There was an error deleting the user. Please check the server
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
                    Are you sure you want to do this? This action cannot be
                    undone.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <Button
                disabled={pending}
                type={'submit'}
                variant={'destructive'}
              >
                {pending ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
