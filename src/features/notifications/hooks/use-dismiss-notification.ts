import { useCallback } from 'react';

import { useSupabase } from '~/core/database/supabase/hooks/use-supabase';

export function useDismissNotification() {
  const client = useSupabase();

  return useCallback(
    async (notification: number) => {
      const { error } = await client
        .from('notifications')
        .update({ dismissed: true })
        .eq('id', notification);

      if (error) {
        throw error;
      }
    },
    [client],
  );
}
