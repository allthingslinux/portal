'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from '@radix-ui/react-icons';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useUpdateUser } from '@portal/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import { Button } from '@portal/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@portal/ui/form';
import { If } from '@portal/ui/if';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@portal/ui/input-group';
import { toast } from '@portal/ui/sonner';
import { Trans } from '@portal/ui/trans';

import { UpdateEmailSchema } from '../../../schema/update-email.schema';

function createEmailResolver(
  currentEmail: string | null,
  emailsNotMatchingMessage: string,
  emailNotChangedMessage: string,
) {
  const schema = UpdateEmailSchema.withTranslation(emailsNotMatchingMessage);

  // If there's a current email, ensure the new email is different
  if (currentEmail) {
    return zodResolver(
      schema.refine(
        (data) => {
          return data.email !== currentEmail;
        },
        {
          path: ['email'],
          message: emailNotChangedMessage,
        },
      ),
    );
  }

  // If no current email, just validate the schema
  return zodResolver(schema);
}

export function UpdateEmailForm({
  email,
  callbackPath,
  onSuccess,
}: {
  email?: string | null;
  callbackPath: string;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation('account');
  const updateUserMutation = useUpdateUser();
  const isSettingEmail = !email;

  const updateEmail = ({ email }: { email: string }) => {
    const promise = async () => {
      const redirectTo = new URL(
        callbackPath,
        window.location.origin,
      ).toString();

      await updateUserMutation.mutateAsync({ email, redirectTo });

      if (onSuccess) {
        onSuccess();
      }
    };

    toast.promise(promise, {
      success: t(isSettingEmail ? 'setEmailSuccess' : 'updateEmailSuccess'),
      loading: t(isSettingEmail ? 'setEmailLoading' : 'updateEmailLoading'),
      error: t(isSettingEmail ? 'setEmailError' : 'updateEmailError'),
    });
  };

  const form = useForm({
    resolver: createEmailResolver(
      email ?? null,
      t('emailNotMatching'),
      t('emailNotChanged'),
    ),
    defaultValues: {
      email: '',
      repeatEmail: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4'}
        data-test={'account-email-form'}
        onSubmit={form.handleSubmit(updateEmail)}
      >
        <If condition={updateUserMutation.data}>
          <Alert variant={'success'}>
            <CheckIcon className={'h-4'} />

            <AlertTitle>
              <Trans
                i18nKey={
                  isSettingEmail
                    ? 'account:setEmailSuccess'
                    : 'account:updateEmailSuccess'
                }
              />
            </AlertTitle>

            <AlertDescription>
              <Trans
                i18nKey={
                  isSettingEmail
                    ? 'account:setEmailSuccessMessage'
                    : 'account:updateEmailSuccessMessage'
                }
              />
            </AlertDescription>
          </Alert>
        </If>

        <div className={'flex flex-col space-y-4'}>
          <div className="flex flex-col space-y-2">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup className="dark:bg-background">
                      <InputGroupAddon align="inline-start">
                        <Mail className="h-4 w-4" />
                      </InputGroupAddon>

                      <InputGroupInput
                        data-test={'account-email-form-email-input'}
                        required
                        type={'email'}
                        placeholder={t(
                          isSettingEmail
                            ? 'account:emailAddress'
                            : 'account:newEmail',
                        )}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
              name={'email'}
            />

            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup className="dark:bg-background">
                      <InputGroupAddon align="inline-start">
                        <Mail className="h-4 w-4" />
                      </InputGroupAddon>

                      <InputGroupInput
                        {...field}
                        data-test={'account-email-form-repeat-email-input'}
                        required
                        type={'email'}
                        placeholder={t('account:repeatEmail')}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
              name={'repeatEmail'}
            />
          </div>

          <div>
            <Button disabled={updateUserMutation.isPending}>
              <Trans
                i18nKey={
                  isSettingEmail
                    ? 'account:setEmailAddress'
                    : 'account:updateEmailSubmitLabel'
                }
              />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
