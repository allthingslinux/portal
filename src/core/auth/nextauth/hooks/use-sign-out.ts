'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';

/**
 * Hook to sign out
 * Replaces useSignOut from Supabase
 */
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      await nextAuthSignOut({ redirect: true, redirectTo: '/' });
    },
  });
}

