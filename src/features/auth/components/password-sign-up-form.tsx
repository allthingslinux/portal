'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import { Trans } from '~/components/makerkit/trans';

import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { EmailInput } from './email-input';
import { PasswordInput } from './password-input';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';

interface PasswordSignUpFormProps {
  defaultValues?: {
    email: string;
  };

  displayTermsCheckbox?: boolean;

  onSubmit: (params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
}

export function PasswordSignUpForm({
  defaultValues,
  displayTermsCheckbox,
  onSubmit,
  loading,
}: PasswordSignUpFormProps) {
  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      email: defaultValues?.email ?? '',
      password: '',
      repeatPassword: '',
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
                  <EmailInput data-test={'email-input'} {...field} />
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'repeatPassword'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    data-test={'repeat-password-input'}
                    {...field}
                  />
                </FormControl>

                <FormDescription>
                  <Trans i18nKey={'auth:repeatPasswordDescription'} />
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <If condition={displayTermsCheckbox}>
          <TermsAndConditionsFormField />
        </If>

        <Button
          data-test={'auth-submit-button'}
          className={'w-full'}
          type="submit"
          disabled={loading}
        >
          <If
            condition={loading}
            fallback={
              <>
                <Trans i18nKey={'auth:signUpWithEmail'} />

                <ArrowRight
                  className={
                    'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                  }
                />
              </>
            }
          >
            <Trans i18nKey={'auth:signingUp'} />
          </If>
        </Button>
      </form>
    </Form>
  );
}
