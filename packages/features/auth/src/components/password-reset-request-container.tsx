'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useRequestResetPassword } from '@portal/supabase/hooks/use-request-reset-password';
import { Alert, AlertDescription } from '@portal/ui/alert';
import { Button } from '@portal/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@portal/ui/form';
import { If } from '@portal/ui/if';
import { Input } from '@portal/ui/input';
import { Trans } from '@portal/ui/trans';

import { useCaptcha } from '../captcha/client';
import { AuthErrorAlert } from './auth-error-alert';

const PasswordResetSchema = z.object({
  email: z.string().email(),
});

export function PasswordResetRequestContainer(params: {
  redirectPath: string;
  captchaSiteKey?: string;
}) {
  const { t } = useTranslation('auth');
  const resetPasswordMutation = useRequestResetPassword();
  const captcha = useCaptcha({ siteKey: params.captchaSiteKey });

  const error = resetPasswordMutation.error;
  const success = resetPasswordMutation.data;

  const form = useForm<z.infer<typeof PasswordResetSchema>>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <>
      <If condition={success}>
        <Alert variant={'success'}>
          <AlertDescription>
            <Trans i18nKey={'auth:passwordResetSuccessMessage'} />
          </AlertDescription>
        </Alert>
      </If>

      <If condition={!resetPasswordMutation.data}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ email }) => {
              const redirectTo = new URL(
                params.redirectPath,
                window.location.origin,
              ).href;

              return resetPasswordMutation
                .mutateAsync({
                  email,
                  redirectTo,
                  captchaToken: captcha.token,
                })
                .catch(() => {
                  captcha.reset();
                });
            })}
            className={'w-full'}
          >
            <div className={'flex flex-col gap-y-4'}>
              <AuthErrorAlert error={error} />

              <FormField
                name={'email'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey={'common:emailAddress'} />
                    </FormLabel>

                    <FormControl>
                      <Input
                        required
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={resetPasswordMutation.isPending} type="submit">
                <Trans i18nKey={'auth:passwordResetLabel'} />
              </Button>
            </div>
            {captcha.field}
          </form>
        </Form>
      </If>
    </>
  );
}
