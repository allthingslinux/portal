'use client';

import { useCallback, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

import { useMonitoring } from '~/core/monitoring/api/hooks';
import { useAppEvents } from '~/shared/events';

export function AuthProvider(props: React.PropsWithChildren) {
  return (
    <SessionProvider>
      <AuthEventDispatcher>{props.children}</AuthEventDispatcher>
    </SessionProvider>
  );
}

function AuthEventDispatcher({ children }: React.PropsWithChildren) {
  const { data: session, status } = useSession();
  const dispatchEvent = useDispatchAppEventFromAuthEvent();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      dispatchEvent('SIGNED_IN', session.user.id, {
        email: session.user.email || '',
      });
    } else if (status === 'unauthenticated') {
      // Handle sign out if needed
    }
  }, [status, session, dispatchEvent]);

  return <>{children}</>;
}

function useDispatchAppEventFromAuthEvent() {
  const { emit } = useAppEvents();
  const monitoring = useMonitoring();

  return useCallback(
    (
      type: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED',
      userId: string | undefined,
      traits: Record<string, string> = {},
    ) => {
      switch (type) {
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
