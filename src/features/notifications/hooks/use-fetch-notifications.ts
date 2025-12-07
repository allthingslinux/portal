import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '~/core/database/supabase/hooks/use-supabase';

import { Notification } from '../types';
import { useNotificationsStream } from './use-notifications-stream';

export function useFetchNotifications({
  onNotifications,
  accountIds,
  realtime,
}: {
  onNotifications: (notifications: Notification[]) => unknown;
  accountIds: string[];
  realtime: boolean;
}) {
  const { data: initialNotifications } = useFetchInitialNotifications({
    accountIds,
  });

  useNotificationsStream({
    onNotifications,
    accountIds,
    enabled: realtime,
  });

  useEffect(() => {
    if (initialNotifications) {
      onNotifications(initialNotifications);
    }
  }, [initialNotifications, onNotifications]);
}

import { fetchNotificationsAction } from '~/features/accounts/server/notifications-server-actions';

function useFetchInitialNotifications(props: { accountIds: string[] }) {
  return useQuery({
    queryKey: ['notifications', ...props.accountIds],
    queryFn: async () => {
      return await fetchNotificationsAction(props.accountIds);
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
