'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

import type { JWTUserData } from '../types';

/**
 * Hook to get the current user session
 * Replaces useUser from Supabase
 */
export function useSession() {
  const { data: session, status } = useNextAuthSession();

  // Convert NextAuth session to JWTUserData format for backward compatibility
  const user: JWTUserData | undefined = session?.user
    ? {
        id: session.user.id,
        email: session.user.email || '',
        phone: '',
        is_anonymous: false,
        aal: 'aal1',
        app_metadata: {},
        user_metadata: {
          name: session.user.name || '',
          image: session.user.image || '',
        },
        amr: [],
      }
    : undefined;

  return {
    data: user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
  };
}

