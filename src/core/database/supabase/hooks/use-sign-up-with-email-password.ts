import { useSignUpWithEmailPassword as useNextAuthSignUp } from '~/core/auth/nextauth/hooks';

interface Credentials {
  email: string;
  password: string;
  emailRedirectTo: string;
  captchaToken?: string;
}

/**
 * @deprecated Use useSignUpWithEmailPassword from ~/core/auth/nextauth/hooks instead
 * This is kept for backward compatibility
 */
export function useSignUpWithEmailAndPassword() {
  const mutation = useNextAuthSignUp();

  return {
    ...mutation,
    mutateAsync: async (params: Credentials) => {
      const result = await mutation.mutateAsync({
        email: params.email,
        password: params.password,
        emailRedirectTo: params.emailRedirectTo,
        captchaToken: params.captchaToken,
      });

      // Return in Supabase-compatible format
      return {
        data: {
          user: {
            id: result.userId,
            email: params.email,
            identities: [],
          },
          session: null,
        },
        error: null,
      };
    },
  };
}
