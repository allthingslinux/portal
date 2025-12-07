import NextAuth from 'next-auth';

import { nextAuthConfig } from './config';

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);

