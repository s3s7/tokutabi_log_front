
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import Loading from '@/app/components/ui/Loading';
import type { 
  UseAuthGuardOptions, 
  AuthGuardState, 
  ExtendedSession, 
  AuthUser, 
  AuthError,
  UserRole
} from '@/types/auth';

export function useAuthGuard(options: UseAuthGuardOptions = {}): AuthGuardState {
  const {
    redirectTo = '/auth/login',
    loadingMessage = '読み込み中...',
    loadingSize = 'md',
    requiredRole,
    requireEmailVerified = false,
    onAuthError,
    onUnauthorized,
    enableAutoRefresh = true
  } = options;

  const { data: session, status, update } = useSession();
  const router = useRouter();

  // 基本的な認証状態
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';

  // 型安全なセッション変換
  const extendedSession = useMemo((): ExtendedSession | null => {
    if (!session || !isAuthenticated) return null;
    
    // セッションユーザーから必要な情報を抽出（型安全）
    const sessionUser = session.user as unknown as {
      id?: string;
      email?: string;
      name?: string | null;
      image?: string | null;
      role?: UserRole;
      emailVerified?: Date | null;
    };
    
    return {
      ...session,
      user: {
        id: sessionUser.email || sessionUser.id || '',
        name: sessionUser.name || null,
        email: sessionUser.email || null,
        image: sessionUser.image || null,
        role: sessionUser.role || 1, // デフォルト: general(1)
        emailVerified: sessionUser.emailVerified || null,
      },
      expires: session.expires
    } as ExtendedSession;
  }, [session, isAuthenticated]);

  // AuthUser型への変換
  const user = useMemo((): AuthUser | null => {
    if (!extendedSession) return null;
    
    return {
      id: extendedSession.user.id,
      name: extendedSession.user.name,
      email: extendedSession.user.email,
      image: extendedSession.user.image,
      role: extendedSession.user.role,
      emailVerified: extendedSession.user.emailVerified,
      createdAt: undefined, // APIから取得する場合に使用
      lastLoginAt: undefined, // APIから取得する場合に使用
    };
  }, [extendedSession]);

  // 権限チェック
  const hasRequiredRole = useMemo((): boolean => {
    if (!requiredRole || !user?.role) return true;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  }, [requiredRole, user?.role]);

  // メール認証チェック
  const isEmailVerified = useMemo((): boolean => {
    if (!requireEmailVerified) return true;
    return Boolean(user?.emailVerified);
  }, [requireEmailVerified, user?.emailVerified]);

  // エラー状態の管理
  const error = useMemo((): AuthError | null => {
    if (!isAuthenticated || !user) return null;

    // 権限チェック
    if (!hasRequiredRole) {
      return {
        type: 'FORBIDDEN',
        message: '必要な権限がありません',
        status: 403,
        timestamp: new Date(),
        details: { requiredRole, userRole: user.role }
      };
    }

    // メール認証チェック
    if (requireEmailVerified && !user.emailVerified) {
      return {
        type: 'FORBIDDEN', 
        message: 'メールアドレスの認証が必要です',
        status: 403,
        timestamp: new Date()
      };
    }

    return null;
  }, [isAuthenticated, user, hasRequiredRole, requireEmailVerified, requiredRole]);

  // アクセス権限の総合チェック
  const checkAccess = useCallback((): boolean => {
    if (!isAuthenticated) return false;
    if (!hasRequiredRole) return false;
    if (!isEmailVerified) return false;
    return true;
  }, [isAuthenticated, hasRequiredRole, isEmailVerified]);

  // エラー処理状態の管理
  const [processedError, setProcessedError] = useState<string | null>(null);

  // 認証状態変化時のリダイレクト処理
  useEffect(() => {
    const errorKey = `${isUnauthenticated}-${isAuthenticated}-${hasRequiredRole}-${isEmailVerified}`;
    
    // 同じエラー状態を既に処理している場合はスキップ
    if (processedError === errorKey) {
      return;
    }

    if (isUnauthenticated) {
      setProcessedError(errorKey);
      onUnauthorized?.();
      router.push(redirectTo);
      return;
    }

    if (isAuthenticated && !hasRequiredRole) {
      setProcessedError(errorKey);
      const roleError: AuthError = {
        type: 'FORBIDDEN',
        message: '必要な権限がありません',
        status: 403,
        timestamp: new Date(),
        details: { requiredRole, userRole: user?.role }
      };
      
      onAuthError?.(roleError);
      router.push('/unauthorized');
      return;
    }

    if (isAuthenticated && !isEmailVerified) {
      setProcessedError(errorKey);
      const verificationError: AuthError = {
        type: 'FORBIDDEN',
        message: 'メールアドレスの認証が必要です',
        status: 403,
        timestamp: new Date()
      };
      
      onAuthError?.(verificationError);
      router.push('/auth/verify-email');
      return;
    }

    // すべての条件をクリアした場合、処理済みエラーをリセット
    if (isAuthenticated && hasRequiredRole && isEmailVerified) {
      setProcessedError(null);
    }
  }, [
    isUnauthenticated, 
    isAuthenticated, 
    hasRequiredRole, 
    isEmailVerified,
    processedError,
    onUnauthorized, 
    onAuthError,
    router, 
    redirectTo,
    requiredRole,
    user?.role
  ]);

  // エラー発生時のコールバック実行（重複処理を防ぐため、メイン useEffect で処理）

  // 自動セッションリフレッシュ
  useEffect(() => {
    if (!enableAutoRefresh || !extendedSession) return;

    const refreshInterval = setInterval(async () => {
      try {
        await update();
      } catch (error) {
        console.error('Session refresh failed:', error);
        
        // リフレッシュ失敗時のエラーハンドリング
        const refreshError: AuthError = {
          type: 'SESSION_EXPIRED',
          message: 'セッションの更新に失敗しました',
          status: 401,
          timestamp: new Date(),
          details: { error }
        };
        
        onAuthError?.(refreshError);
      }
    }, 5 * 60 * 1000); // 5分間隔

    return () => clearInterval(refreshInterval);
  }, [enableAutoRefresh, extendedSession, update, onAuthError]);

  // ローディング画面の描画
  const renderGuard = useCallback((): React.JSX.Element | null => {
    if (isLoading) {
      return React.createElement(Loading, {
        message: loadingMessage,
        size: loadingSize,
        fullScreen: true
      });
    }

    if (isUnauthenticated) {
      return React.createElement(Loading, {
        message: "ログイン画面に移動しています...",
        size: loadingSize,
        fullScreen: true
      });
    }

    if (isAuthenticated && !hasRequiredRole) {
      return React.createElement(Loading, {
        message: "権限を確認しています...",
        size: loadingSize,
        fullScreen: true
      });
    }

    if (isAuthenticated && !isEmailVerified) {
      return React.createElement(Loading, {
        message: "メール認証画面に移動中...",
        size: loadingSize,
        fullScreen: true
      });
    }

    // すべての条件をクリアした場合はnullを返す（ガード不要）
    return null;
  }, [
    isLoading, 
    isUnauthenticated, 
    isAuthenticated, 
    hasRequiredRole, 
    isEmailVerified,
    loadingMessage, 
    loadingSize
  ]);

  // 戻り値
  return {
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    session: extendedSession,
    user,
    status,
    error,
    hasRequiredRole,
    isEmailVerified,
    checkAccess,
    renderGuard
  };
}
