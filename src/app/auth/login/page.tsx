'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState('google'); // 'google' or 'email'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn('google', { 
        callbackUrl: '/auth/callback',
        redirect: true
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsSigningIn(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '', form: '' };
    
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ email: '', password: '', form: '' });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        // ログイン成功 - トークンを保存してリダイレクト
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_info', JSON.stringify(result.user));
        router.push('/');
      } else {
        // ログイン失敗
        setErrors({ ...errors, form: result.error || 'ログインに失敗しました' });
      }
    } catch (error) {
      console.error('Email login error:', error);
      setErrors({ ...errors, form: 'ネットワークエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <div className="text-center">
            {/* ロゴ/タイトル */}
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex justify-center items-center gap-2">
              <i className="fas fa-seedling text-4xl text-green-500"></i>
              <span>とくたびログ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              旅行の思い出を記録しよう
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ログイン・新規登録
              </h2>
              <p className="text-gray-600">
                お好みの方法でログインできます
              </p>
            </div>

            {/* ログイン方法選択タブ */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLoginMethod('google')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'google'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Google
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                メールアドレス
              </button>
            </div>

            {loginMethod === 'google' ? (
              // Googleログイン
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
                    ログイン中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Googleでログイン
                  </>
                )}
              </button>
            ) : (
              // メールアドレスログイン
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* フォームエラー */}
                {errors.form && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{errors.form}</p>
                  </div>
                )}

                {/* メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* パスワード */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="6文字以上のパスワード"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* ログインボタン */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      ログイン中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </button>

                {/* 新規登録リンク */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    アカウントをお持ちでない方は{' '}
                    <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
                      新規登録
                    </Link>
                  </p>
                </div>
              </form>
            )}

            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ログインすることで、
                  <br />
                  利用規約とプライバシーポリシーに同意したものとみなします
                </p>
              </div>
            </div>
          </div>

          {/* 戻るリンク */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.back()}
              className="text-orange-600 hover:text-orange-500 text-sm font-medium"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}