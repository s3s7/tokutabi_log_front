import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

// NextAuthのサーバーサイドコールバックではDockerネットワーク内URLを使用
const serverApiUrl = 'http://back:3000';

export const authOptions: AuthOptions = {
	debug: process.env.NODE_ENV === 'development',
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
		}),
	],
	pages: {
		signIn: '/auth/login',
	},
	callbacks: {
		async signIn({ user, account }) {
			const provider = account?.provider;
			const uid = user?.id;
			const name = user?.name;
			const email = user?.email;

			// パラメータ検証
			if (!provider || !uid || !name || !email) {
				console.error('[NextAuth] Missing required OAuth parameters');
				return false;
			}

			if (!serverApiUrl) {
				console.error('[NextAuth] Server API URL not configured');
				return false;
			}

			try {
				const response = await axios.post(
					`${serverApiUrl}/api/v1/auth/${provider}/callback`,
					{
						provider,
						uid,
						name,
						email,
					}
				);
				
				return response.status === 200 || response.status === 201;
			} catch (error) {
				console.error('[NextAuth] OAuth callback failed:', error instanceof Error ? error.message : 'Unknown error');
				return false;
			}
		},
		
		async session({ session, token }) {
			// セッションにuser.idとroleを追加
			if (session.user) {
				session.user.id = token.sub as string;
				session.user.role = (token.role as number) || 1; // デフォルト: general(1)
			}
			return session;
		},

		async jwt({ token, account, user }) {
			// 初回ログイン時またはトークン更新時
			if (account && user) {
				token.provider = account.provider;
				token.uid = user.id;
				
				// バックエンドからユーザー情報を取得してroleを設定
				try {
					const response = await axios.get(
						`${serverApiUrl}/api/v1/users/${account.provider}/${user.id}`
					);
					
					if (response.data?.user) {
						token.role = response.data.user.role;
						token.backendId = response.data.user.id;
					} else {
						token.role = 1; // デフォルト: general(1)
					}
				} catch (error) {
					console.error('[NextAuth] Failed to fetch user role during JWT callback:', error);
					token.role = 1; // デフォルト: general(1)
				}
			}
			return token;
		},
	},
};
