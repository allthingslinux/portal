'use client';

import { useCallback } from 'react';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { useMonitoring } from '@portal/monitoring/hooks';
import { useAppEvents } from '@portal/shared/events';
import { useAuthChangeListener } from '@portal/supabase/hooks/use-auth-change-listener';

export function AuthProvider(props: React.PropsWithChildren) {
  const dispatchEvent = useDispatchAppEventFromAuthEvent();

  const onEvent = useCallback(
    (event: AuthChangeEvent, session: Session | null) => {
      dispatchEvent(event, session?.user.id, {
        email: session?.user.email ?? '',
      });
    },
    [dispatchEvent],
  );

  useAuthChangeListener({
    onEvent,
  });

  return props.children;
}

function useDispatchAppEventFromAuthEvent() {
  const { emit } = useAppEvents();
  const monitoring = useMonitoring();

  return useCallback(
    (
      type: AuthChangeEvent,
      userId: string | undefined,
      traits: Record<string, string> = {},
    ) => {
      switch (type) {
        case 'INITIAL_SESSION':
          if (userId) {
            emit({
              type: 'user.signedIn',
              payload: { userId, ...traits },
            });

            monitoring.identifyUser({ id: userId, ...traits });
          }

          break;

        case 'SIGNED_IN':
          if (userId) {
            emit({
              type: 'user.signedIn',
              payload: { userId, ...traits },
            });

            monitoring.identifyUser({ id: userId, ...traits });
          }

          break;

        case 'USER_UPDATED':
          emit({
            type: 'user.updated',
            payload: { userId: userId!, ...traits },
          });

          break;
      }
    },
    [emit, monitoring],
  );
}
