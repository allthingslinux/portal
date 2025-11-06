'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '~/components/ui/input-group';
import { Trans } from '~/components/makerkit/trans';

import { PasswordSignInSchema } from '../schemas/password-sign-in.schema';
import { PasswordInput } from './password-input';

export function PasswordSignInForm({
  onSubmit,
  loading = false,
  redirecting = false,
}: {
  onSubmit: (params: z.infer<typeof PasswordSignInSchema>) => unknown;
  loading: boolean;
  redirecting: boolean;
}) {
  const { t } = useTranslation('auth');

  const form = useForm<z.infer<typeof PasswordSignInSchema>>({
    resolver: zodResolver(PasswordSignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'flex w-full flex-col gap-y-4'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className={'flex flex-col space-y-2.5'}>
          <FormField
            control={form.control}
            name={'email'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon>
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>

                    <InputGroupInput
                      data-test={'email-input'}
                      required
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'password'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>

                <FormMessage />

                <div>
                  <Button
                    asChild
                    type={'button'}
                    size={'sm'}
                    variant={'link'}
                    className={'text-xs'}
                  >
                    <Link href={'/auth/password-reset'}>
                      <Trans i18nKey={'auth:passwordForgottenQuestion'} />
                    </Link>
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button
          data-test="auth-submit-button"
          className={'group w-full'}
          type="submit"
          disabled={loading || redirecting}
        >
          <If condition={redirecting}>
            <span className={'animate-in fade-in slide-in-from-bottom-24'}>
              <Trans i18nKey={'auth:redirecting'} />
            </span>
          </If>

          <If condition={loading}>
            <span className={'animate-in fade-in slide-in-from-bottom-24'}>
              <Trans i18nKey={'auth:signingIn'} />
            </span>
          </If>

          <If condition={!redirecting && !loading}>
            <span className={'animate-out fade-out flex items-center'}>
              <Trans i18nKey={'auth:signInWithEmail'} />

              <ArrowRight
                className={
                  'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                }
              />
            </span>
          </If>
        </Button>
      </form>
    </Form>
  );
}
