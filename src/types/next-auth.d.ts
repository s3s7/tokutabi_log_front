// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string
//       name?: string | null
//       email?: string | null
//       image?: string | null
//       role: number
//     }
//   }

//   interface User {
//     id: string
//     role?: number
//     backendId?: string
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     provider?: string
//     uid?: string
//     role?: number
//     backendId?: string
//   }
// }
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: number;
    provider?: string;
    uid?: string;
    backendId?: string;
  }
}
