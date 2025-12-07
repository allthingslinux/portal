import type { SignInWithOAuthCredentials } from '../supabase-types';

import { useSignInWithProvider as useNextAuthSignInWithProvider } from '~/core/auth/nextauth/hooks';

/**
 * @deprecated Use useSignInWithProvider from ~/core/auth/nextauth/hooks instead
 * This is kept for backward compatibility
 */
export function useSignInWithProvider() {
  const mutation = useNextAuthSignInWithProvider();

  return {
    ...mutation,
    mutateAsync: async (credentials: SignInWithOAuthCredentials) => {
      // Map Supabase provider names to NextAuth provider names
      const providerMap: Record<string, string> = {
        google: 'google',
        github: 'github',
        apple: 'apple',
        microsoft: 'microsoft',
        facebook: 'facebook',
        keycloak: 'keycloak',
      };

      const provider = providerMap[credentials.provider] || credentials.provider;

      await mutation.mutateAsync({
        provider: provider as 'google' | 'github' | 'apple' | 'microsoft' | 'facebook' | 'keycloak',
        redirectTo: credentials.options?.redirectTo,
      });

      // Return in Supabase-compatible format
      return {
        url: credentials.options?.redirectTo || '/home',
      };
    },
  };
}
