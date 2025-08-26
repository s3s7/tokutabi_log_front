'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  name: string;
  email: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchUserData();
    }
  }, [session, status, router]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUserData = async () => {
    try {
      if (!session?.user?.id) {
        setError('ユーザーIDが取得できません');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const provider = 'google'; // 現在はGoogleのみサポート
      const uid = session.user.id;

      const response = await axios.get(
        `${apiUrl}/api/v1/users/${provider}/${uid}`
      );

      if (response.status === 200) {
        setUserData(response.data.user);
      } else {
        setError('ユーザー情報の取得に失敗しました');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (axios.isAxiosError(err)) {
        setError(`API エラー: ${err.response?.data?.error || err.message}`);
      } else {
        setError('ユーザー情報の取得中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (userData) {
      setEditForm({ name: userData.name });
      setIsEditing(true);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({ name: '' });
    setError(null);
    setSuccessMessage(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setEditForm({ name: value });
      setError(null);
    }
  };

  const saveProfile = async () => {
    if (!session?.user?.id || !userData) {
      setError('ユーザー情報が取得できません');
      return;
    }

    if (!editForm.name.trim()) {
      setError('名前を入力してください');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const provider = 'google';
      const uid = session.user.id;

      const response = await axios.put(
        `${apiUrl}/api/v1/users/${provider}/${uid}`,
        { name: editForm.name.trim() }
      );

      if (response.status === 200) {
        setUserData(response.data.user);
        setSuccessMessage(response.data.message || 'プロフィールを更新しました');
        setIsEditing(false);
        setEditForm({ name: '' });
      } else {
        setError('更新に失敗しました');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (axios.isAxiosError(err)) {
        setError(`更新エラー: ${err.response?.data?.error || err.message}`);
      } else {
        setError('プロフィール更新中にエラーが発生しました');
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!session || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">ログインが必要です</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-6">
              {session.user?.image && (
                <img
                  className="h-20 w-20 rounded-full"
                  src={session.user.image}
                  alt={userData.name}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {userData.provider}アカウント
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  プロフィール情報
                </h2>
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    編集
                  </button>
                )}
              </div>
              
              {successMessage && (
                <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
                  <div className="text-sm text-green-800">{successMessage}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    お名前
                  </label>
                  <div className="mt-1">
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={handleNameChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="名前を入力してください"
                          maxLength={20}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {editForm.name.length}/20文字
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {userData.name}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    メールアドレス
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {userData.email}
                    <div className="text-xs text-gray-500 mt-1">
                      メールアドレスは変更できません
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    登録日時
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(userData.created_at)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    最終更新
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(userData.updated_at)}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving || !editForm.name.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ホームに戻る
              </button>
              {!isEditing && (
                <button
                  onClick={fetchUserData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  情報を更新
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}