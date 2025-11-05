import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Database } from '@portal/supabase/database';
import { Button } from '@portal/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@portal/ui/form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@portal/ui/input-group';
import { toast } from '@portal/ui/sonner';
import { Trans } from '@portal/ui/trans';

import { useUpdateAccountData } from '../../hooks/use-update-account';
import { AccountDetailsSchema } from '../../schema/account-details.schema';

type UpdateUserDataParams = Database['public']['Tables']['accounts']['Update'];

export function UpdateAccountDetailsForm({
  displayName,
  onUpdate,
  userId,
}: {
  displayName: string;
  userId: string;
  onUpdate: (user: Partial<UpdateUserDataParams>) => void;
}) {
  const updateAccountMutation = useUpdateAccountData(userId);
  const { t } = useTranslation('account');

  const form = useForm({
    resolver: zodResolver(AccountDetailsSchema),
    defaultValues: {
      displayName,
    },
  });

  const onSubmit = ({ displayName }: { displayName: string }) => {
    const data = { name: displayName };

    const promise = updateAccountMutation.mutateAsync(data).then(() => {
      onUpdate(data);
    });

    return toast.promise(() => promise, {
      success: t(`updateProfileSuccess`),
      error: t(`updateProfileError`),
      loading: t(`updateProfileLoading`),
    });
  };

  return (
    <div className={'flex flex-col space-y-8'}>
      <Form {...form}>
        <form
          data-test={'update-account-name-form'}
          className={'flex flex-col space-y-4'}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name={'displayName'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon align="inline-start">
                      <User className="h-4 w-4" />
                    </InputGroupAddon>

                    <InputGroupInput
                      data-test={'account-display-name'}
                      minLength={2}
                      placeholder={t('account:name')}
                      maxLength={100}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button disabled={updateAccountMutation.isPending}>
              <Trans i18nKey={'account:updateProfileSubmitLabel'} />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
