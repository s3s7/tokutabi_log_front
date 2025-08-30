import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// プロバイダーに応じてインポート
import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    // 使用するプロバイダーを設定
 
    
    // Google認証を使う場合
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    
    // カスタム認証を使う場合
    // CredentialsProvider({
    //   name: 'credentials',
    //   credentials: {
    //     email: { label: 'Email', type: 'email' },
    //     password: { label: 'Password', type: 'password' }
    //   },
    //   async authorize(credentials) {
    //     // 認証ロジックを実装
    //     if (credentials?.email && credentials?.password) {
    //       // バックエンドAPIで認証
    //       const user = await authenticateUser(credentials.email, credentials.password);
    //       return user || null;
    //     }
    //     return null;
    //   }
    // }),
  ],
  
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
  },
