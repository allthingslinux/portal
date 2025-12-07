import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Database } from '~/core/database/supabase/database.types';
import { updateAccountDataAction } from '../server/personal-accounts-server-actions';

type UpdateData = Database['public']['Tables']['accounts']['Update'];

export function useUpdateAccountData(accountId: string) {
  const queryClient = useQueryClient();
  const mutationKey = ['account:data', accountId];

  const mutationFn = async (data: UpdateData) => {
    await updateAccountDataAction(accountId, {
      name: data.name ?? undefined,
      public_data: data.public_data as Record<string, unknown> | undefined,
    });

    // Invalidate account data queries
    await queryClient.invalidateQueries({ queryKey: ['account:data'] });
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
