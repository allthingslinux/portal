'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSupabase } from '~/core/database/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { Trans } from '~/components/makerkit/trans';

import { useCaptcha } from '../captcha/client';
import { EmailInput } from './email-input';

export function ResendAuthLinkForm(props: {
  redirectPath?: string;
  captchaSiteKey?: string;
}) {
  const captcha = useCaptcha({ siteKey: props.captchaSiteKey });
  const resendLink = useResendLink(captcha.token);

  const form = useForm({
    resolver: zodResolver(z.object({ email: z.string().email() })),
    defaultValues: {
      email: '',
    },
  });

  if (resendLink.data && !resendLink.isPending) {
    return (
      <Alert variant={'success'}>
        <AlertTitle>
          <Trans i18nKey={'auth:resendLinkSuccess'} />
        </AlertTitle>

        <AlertDescription>
          <Trans
            i18nKey={'auth:resendLinkSuccessDescription'}
            defaults={'Success!'}
          />
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-2'}
        onSubmit={form.handleSubmit((data) => {
          const promise = resendLink.mutateAsync({
            email: data.email,
            redirectPath: props.redirectPath,
          });

          promise.finally(() => {
            captcha.reset();
          });

          return promise;
        })}
      >
        <FormField
          name={'email'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <EmailInput data-test="email-input" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button disabled={resendLink.isPending}>
          <Trans i18nKey={'auth:resendLink'} defaults={'Resend Link'} />
        </Button>
      </form>

      {captcha.field}
    </Form>
  );
}

function useResendLink(captchaToken: string) {
  const supabase = useSupabase();

  const mutationFn = async (props: {
    email: string;
    redirectPath?: string;
  }) => {
    const response = await supabase.auth.resend({
      email: props.email,
      type: 'signup',
      options: {
        emailRedirectTo: props.redirectPath,
        captchaToken,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useMutation({
    mutationFn,
  });
}
