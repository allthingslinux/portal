import { useSession } from '~/core/auth/nextauth/hooks';
import { JWTUserData } from '../types';

/**
 * @deprecated Use useSession from ~/core/auth/nextauth/hooks instead
 * This is kept for backward compatibility
 */
export function useUser(initialData?: JWTUserData | null) {
  const { data, isLoading } = useSession();

  return {
    data: data || initialData || undefined,
    isLoading,
    refetch: async () => {
      // NextAuth handles session refresh automatically
      return { data };
    },
  };
}
