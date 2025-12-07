import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Database } from '~/core/database/supabase/database.types';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '~/components/ui/input-group';
import { Trans } from '~/components/makerkit/trans';
import { useToastAction } from '~/shared/hooks/use-toast-action';

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
  const { execute } = useToastAction({
    success: t(`updateProfileSuccess`),
    error: t(`updateProfileError`),
    loading: t(`updateProfileLoading`),
  });

  const form = useForm({
    resolver: zodResolver(AccountDetailsSchema),
    defaultValues: {
      displayName,
    },
  });

  const onSubmit = ({ displayName }: { displayName: string }) => {
    const data = { name: displayName };

    execute(async () => {
      await updateAccountMutation.mutateAsync(data);
      onUpdate(data);
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
