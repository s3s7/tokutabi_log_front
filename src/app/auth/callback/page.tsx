'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // ログイン成功時にクエリパラメータ付きでホームページにリダイレクト
      router.push('/?login=success');
    } else if (status === 'unauthenticated') {
      // 認証に失敗した場合はログインページにリダイレクト
      router.push('/auth/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">ログイン処理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <i className="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
        <p className="text-gray-600">ログイン成功！リダイレクトしています...</p>
      </div>
    </div>
  );
}