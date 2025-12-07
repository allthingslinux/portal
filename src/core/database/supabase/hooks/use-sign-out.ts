import { useSignOut as useNextAuthSignOut } from '~/core/auth/nextauth/hooks';

/**
 * @deprecated Use useSignOut from ~/core/auth/nextauth/hooks instead
 * This is kept for backward compatibility
 */
export function useSignOut() {
  return useNextAuthSignOut();
}
