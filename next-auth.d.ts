// import 'next-auth';

// import { UserRole } from '@prisma/client';

// declare module 'next-auth' {
//   interface User {
//     role: UserRole;
//   }

//   interface Session {
//     user: {
//       id: string;

//       role: UserRole;
//     } & DefaultSession['user'];
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     role?: UserRole;
//   }
// }

import { UserRole } from '@prisma/client';

import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: UserRole;
      isTwoFactorEnabled: boolean;
      isOAuth: boolean;
    } & DefaultSession['user'];
  }
}

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
};

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    role?: UserRole;
    isTwoFactorEnabled?: boolean;
    isOAuth: boolean;
  }
}
