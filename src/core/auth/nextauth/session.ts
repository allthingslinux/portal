import 'server-only';

import { auth } from './index';
import type { JWTUserData } from './types';

/**
 * Get the current session from NextAuth
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Convert NextAuth session to JWTUserData format for backward compatibility
 */
export async function getSessionUserData(): Promise<JWTUserData | null> {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  // Convert NextAuth session to JWTUserData format
  return {
    id: session.user.id,
    email: session.user.email || '',
    phone: '',
    is_anonymous: false,
    aal: 'aal1', // Default to aal1, can be updated based on MFA status
    app_metadata: {},
    user_metadata: {
      name: session.user.name || '',
      image: session.user.image || '',
    },
    amr: [],
  };
}

