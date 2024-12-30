import NextAuth, { Session, JWT, DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// TypeScript type declaration extensions for additional session and JWT fields
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession['user'];
  }
  interface JWT {
    id?: string;
  }
}

// Simulated in-memory user data
const users = [
  {
    id: '1',
    email: 'demo@gmail.com'
  }
];

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' }
      },
      authorize: async (credentials, req) => {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const { email } = credentials;
        console.log('credentials', credentials);

        if (typeof email !== 'string') {
          throw new Error('Invalid email type');
        }

        // Find the user with the given email
        const user = users.find((u) => u.email === email);
        console.log('user', user);

        if (user) {
          console.log('user', user);
          return { id: user.id, email: user.email };
        }

        // In case of an invalid email
        throw new Error('Invalid email');
      }
    })
  ],
  pages: {
    signIn: '/login' // Your custom sign-in page
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        console.log('session', session);
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        console.log('user', user);
        token.id = user.id;
      }
      return token;
    }
  }
});

export default auth;
