import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Keycloak from 'next-auth/providers/keycloak';

import authConfig from '~/core/config/auth.config';
import { authenticateUser } from './auth-helpers';

/**
 * NextAuth configuration
 * This replaces Supabase Auth with NextAuth.js
 */
export const nextAuthConfig = {
  providers: [
    // Credentials provider for email/password
    ...(authConfig.providers.password
      ? [
          Credentials({
            name: 'Credentials',
            credentials: {
              email: { label: 'Email', type: 'email' },
              password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null;
              }

              const user = await authenticateUser(
                credentials.email as string,
                credentials.password as string,
              );

              if (!user) {
                return null;
              }

              return {
                id: user.id,
                email: user.email,
                name: null,
                image: null,
              };
            },
          }),
        ]
      : []),
    // OAuth providers
    ...(authConfig.providers.oAuth.length > 0
      ? authConfig.providers.oAuth
          .map((provider) => {
            if (provider === 'google') {
              return Google({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              });
            }
            if (provider === 'keycloak') {
              return Keycloak({
                clientId: process.env.KEYCLOAK_ID,
                clientSecret: process.env.KEYCLOAK_SECRET,
                issuer: process.env.KEYCLOAK_ISSUER,
              });
            }
            // Add other OAuth providers as needed
            return null;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)
      : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      // OAuth account linking
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    error: '/auth/error',
  },
} satisfies NextAuthConfig;

