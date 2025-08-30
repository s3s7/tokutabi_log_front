import type { Session } from 'next-auth';

// 基本的な認証状態
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// ユーザーの役割（Railsの数値形式に対応）
export type UserRole = 0 | 1 | 2; // 0: guest, 1: general, 2: admin

// NextAuthのSessionを拡張した型
export type ExtendedSession = Omit<Session, 'user'> & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    emailVerified?: Date | null;
  };
  accessToken?: string;
  refreshToken?: string;
};

// 認証ユーザー情報
export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole; // 役割ベースの認証用
  emailVerified?: Date | null; // メール認証状態
  createdAt?: Date;
  lastLoginAt?: Date;
};

// エラータイプの列挙
export type AuthErrorType = 
  | 'UNAUTHORIZED' 
  | 'FORBIDDEN' 
  | 'SESSION_EXPIRED' 
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// 認証エラー情報
export type AuthError = {
  type: AuthErrorType;
  message: string;
  status: number;
  timestamp: Date;
  details?: Record<string, unknown>;
};

// エラーハンドリング用の結果型
export type AuthResult<T> = 
  | { success: true; data: T }
  | { success: false; error: AuthError };

// useAuthGuardフックのオプション
export type UseAuthGuardOptions = {
  redirectTo?: string;
  loadingMessage?: string;
  loadingSize?: 'sm' | 'md' | 'lg';
  requiredRole?: UserRole | UserRole[]; // 必要な役割
  requireEmailVerified?: boolean; // メール認証必須
  onAuthError?: (error: AuthError) => void;
  onUnauthorized?: () => void;
  enableAutoRefresh?: boolean; // 自動トークンリフレッシュ
};

// useAuthGuardフックの戻り値
export type AuthGuardState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  session: ExtendedSession | null;
  user: AuthUser | null;
  status: AuthStatus;
  error: AuthError | null;
  hasRequiredRole: boolean;
  isEmailVerified: boolean;
  checkAccess: () => boolean;
  renderGuard: () => React.JSX.Element | null;
};