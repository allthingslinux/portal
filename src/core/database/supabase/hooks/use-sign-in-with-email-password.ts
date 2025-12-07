import type { SignInWithPasswordCredentials } from '../supabase-types';

import { useSignInWithEmailPassword as useNextAuthSignIn } from '~/core/auth/nextauth/hooks';

/**
 * @deprecated Use useSignInWithEmailPassword from ~/core/auth/nextauth/hooks instead
 * This is kept for backward compatibility
 */
export function useSignInWithEmailPassword() {
  const mutation = useNextAuthSignIn();

  return {
    ...mutation,
    mutateAsync: async (credentials: SignInWithPasswordCredentials) => {
      const result = await mutation.mutateAsync({
        email: credentials.email,
        password: credentials.password,
      });

      // Return in Supabase-compatible format
      return {
        data: {
          user: {
            id: result?.user?.id,
            email: result?.user?.email,
            identities: [],
          },
          session: null,
        },
        error: null,
      };
    },
  };
}
