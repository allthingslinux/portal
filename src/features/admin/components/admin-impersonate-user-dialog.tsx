'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { useSupabase } from '~/core/database/supabase/hooks/use-supabase';
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
import { LoadingOverlay } from '~/components/makerkit/loading-overlay';

import { impersonateUserAction } from '../lib/server/admin-server-actions';
import { ImpersonateUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminImpersonateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  const form = useForm({
    resolver: zodResolver(ImpersonateUserSchema),
    defaultValues: {
      userId: props.userId,
      confirmation: '',
    },
  });

  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  }>();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<boolean | null>(null);

  if (tokens) {
    return (
      <>
        <ImpersonateUserAuthSetter tokens={tokens} />

        <LoadingOverlay>Setting up your session...</LoadingOverlay>
      </>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Impersonate User</AlertDialogTitle>

          <AlertDialogDescription className={'flex flex-col space-y-1'}>
            <span>
              Are you sure you want to impersonate this user? You will be logged
              in as this user. To stop impersonating, log out.
            </span>

            <span>
              <b>NB:</b> If the user has 2FA enabled, you will not be able to
              impersonate them.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            data-test={'admin-impersonate-user-form'}
            className={'flex flex-col space-y-8'}
            onSubmit={form.handleSubmit((data) => {
              startTransition(async () => {
                try {
                  const result = await impersonateUserAction(data);

                  setTokens(result);
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
                  Failed to impersonate user. Please check the logs to
                  understand what went wrong.
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
                    Are you sure you want to impersonate this user?
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <Button disabled={isPending} type={'submit'}>
                {isPending ? 'Impersonating...' : 'Impersonate User'}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ImpersonateUserAuthSetter({
  tokens,
}: React.PropsWithChildren<{
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}>) {
  useSetSession(tokens);

  return <LoadingOverlay>Setting up your session...</LoadingOverlay>;
}

function useSetSession(tokens: { accessToken: string; refreshToken: string }) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['impersonate-user', tokens.accessToken, tokens.refreshToken],
    gcTime: 0,
    queryFn: async () => {
      await supabase.auth.signOut();

      await supabase.auth.setSession({
        refresh_token: tokens.refreshToken,
        access_token: tokens.accessToken,
      });

      // use a hard refresh to avoid hitting cached pages
      window.location.replace('/home');
    },
  });
}
