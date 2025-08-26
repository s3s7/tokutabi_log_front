import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

// NextAuthのサーバーサイドコールバックではDockerネットワーク内URLを使用
const serverApiUrl = 'http://back:3000';

const handler = NextAuth({
	debug: process.env.NODE_ENV === 'development',
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
		}),
	],
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
				session.user.role = token.role as string;
			}
			return session;
		},
		async jwt({ token, account, user }) {
			// JWTトークンに必要な情報を追加
			if (account && user) {
				token.provider = account.provider;
				token.uid = user.id;
				
				// バックエンドからユーザー情報（role含む）を取得
				try {
					const response = await axios.get(
						`${serverApiUrl}/api/v1/users/${user.id}`,
						{
							params: {
								provider: account.provider,
								uid: user.id
							}
						}
					);
					token.role = response.data.role;
				} catch (error) {
					console.error('[NextAuth] Failed to fetch user role:', error);
					token.role = 'general';
				}
			}
			return token;
		},
	},
});
export { handler as GET, handler as POST };

