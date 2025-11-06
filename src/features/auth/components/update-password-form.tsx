'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { z } from 'zod';

import { useUpdateUser } from '~/core/database/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { Heading } from '~/components/ui/heading';
import { Trans } from '~/components/makerkit/trans';

import { PasswordResetSchema } from '../schemas/password-reset.schema';
import { PasswordInput } from './password-input';

export function UpdatePasswordForm(params: {
  redirectTo: string;
  heading?: React.ReactNode;
}) {
  const updateUser = useUpdateUser();
  const router = useRouter();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof PasswordResetSchema>>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
  });

  if (updateUser.error) {
    const error = updateUser.error as unknown as { code: string };

    return <ErrorState error={error} onRetry={() => updateUser.reset()} />;
  }

  return (
    <div className={'flex w-full flex-col space-y-6'}>
      <div className={'flex justify-center'}>
        {params.heading && (
          <Heading className={'text-center'} level={4}>
            {params.heading}
          </Heading>
        )}
      </div>

      <Form {...form}>
        <form
          className={'flex w-full flex-1 flex-col'}
          onSubmit={form.handleSubmit(async ({ password }) => {
            await updateUser.mutateAsync({
              password,
              redirectTo: params.redirectTo,
            });

            router.replace(params.redirectTo);

            toast.success(t('account:updatePasswordSuccessMessage'));
          })}
        >
          <div className={'flex-col space-y-2.5'}>
            <FormField
              name={'password'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput autoComplete={'new-password'} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={'repeatPassword'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput autoComplete={'new-password'} {...field} />
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={'common:repeatPassword'} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={updateUser.isPending}
              type="submit"
              className={'w-full'}
            >
              <Trans i18nKey={'auth:passwordResetLabel'} />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function ErrorState(props: {
  onRetry: () => void;
  error: {
    code: string;
  };
}) {
  const { t } = useTranslation('auth');

  const errorMessage = t(`errors.${props.error.code}`, {
    defaultValue: t('errors.resetPasswordError'),
  });

  return (
    <div className={'flex flex-col space-y-4'}>
      <Alert variant={'destructive'}>
        <ExclamationTriangleIcon className={'s-6'} />

        <AlertTitle>
          <Trans i18nKey={'common:genericError'} />
        </AlertTitle>

        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>

      <Button onClick={props.onRetry} variant={'outline'}>
        <Trans i18nKey={'common:retry'} />
      </Button>
    </div>
  );
}
