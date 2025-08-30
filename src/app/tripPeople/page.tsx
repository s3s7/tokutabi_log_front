'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TripPerson } from '@/types/tripPeople';
import type { FilterState } from '@/types/filterState';
import { RELATIONSHIPS } from '@/constants/relationship';
import { SORT_OPTIONS, SORT_ORDER_OPTIONS } from '@/constants/sort';
import { useToastContext } from '@/app/context/ToastContext';
import { filterTripPeople, hasActiveFilters, createEmptyFilterState } from '@/lib/tripFilter';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';

export default function TripPeoplePage() {
  const router = useRouter();
  const { showError } = useToastContext();
  
  // メモ化されたコールバック関数
  const handleAuthError = useCallback((error: any) => {
    console.error('認証エラー:', {
      type: error.type,
      message: error.message,
      status: error.status,
      details: error.details
    });
    showError(error.message || '認証エラーが発生しました');
  }, [showError]);

  const handleUnauthorized = useCallback(() => {
    showError('ログインが必要です');
  }, [showError]);

  // useAuthGuardを使用した認証ガード
  const {
    isAuthenticated,
    user,
    renderGuard
  } = useAuthGuard({
    redirectTo: '/auth/login',
    loadingMessage: '認証情報を確認中...',
    loadingSize: 'md',
    requiredRole: 1, // 一般ユーザー(1)以上のアクセス権限が必要
    onAuthError: handleAuthError,
    onUnauthorized: handleUnauthorized
  });

  const [tripPeople, setTripPeople] = useState<TripPerson[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<TripPerson[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(createEmptyFilterState());

  // 旅行相手データを取得
  useEffect(() => {
    const fetchTripPeople = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        setDataLoading(true);
        
        // 実際のAPI呼び出し
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        const response = await fetch(`${apiUrl}/api/v1/trip_people`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Provider': 'google',
            'X-Auth-UID': user.id || user.email || '',
          }
        });

        if (response.ok) {
          const result = await response.json();
          setTripPeople(result.trip_people || []);
        } else {
          const result = await response.json();
          console.error('API Error:', result.error);
          showError(result.error || '旅行相手データの取得に失敗しました');
          setTripPeople([]);
        }
        
      } catch (error) {
        console.error('旅行相手データの取得に失敗しました:', error);
        showError('旅行相手データの取得に失敗しました');
        setTripPeople([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchTripPeople();
  }, [isAuthenticated, user, showError]);

  // フィルター適用
  useEffect(() => {
    const filtered = filterTripPeople(tripPeople, filters);
    setFilteredPeople(filtered);
  }, [tripPeople, filters]);

  // 型安全なフィルター変更ハンドラー
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleRelationshipChange = (value: string) => {
    setFilters(prev => ({ ...prev, relationshipId: value }));
  };

  const handleSortByChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value as FilterState['sortBy'] }));
  };

  const handleSortOrderChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortOrder: value as FilterState['sortOrder'] }));
  };

  const clearFilters = () => {
    setFilters(createEmptyFilterState());
  };

  const getRelationshipName = (relationshipId: number) => {
    return RELATIONSHIPS.find(rel => rel.id === relationshipId)?.name || '未設定';
  };

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age > 0 ? age : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric'
    });
  };

  const activeFilters = hasActiveFilters(filters);

  // 認証ガード - 認証が必要な場合はローディング画面やリダイレクトを自動処理
  const guardElement = renderGuard();
  if (guardElement) {
    return guardElement;
  }

  // データ読み込み中の場合
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">旅行相手データを読み込み中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー部分 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            <svg className="w-8 h-8 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            旅行相手一覧
          </h1>
          
          <div className="flex justify-center">
            <Link
              href="/tripPeople/new"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新しい相手を追加
            </Link>
          </div>
        </div>

        {/* 検索・フィルター機能 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="名前、好きなもの、メモで検索"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 関係性フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">関係性</label>
              <select
                value={filters.relationshipId}
                onChange={(e) => handleRelationshipChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべて</option>
                {RELATIONSHIPS.map(relationship => (
                  <option key={relationship.id} value={relationship.id}>
                    {relationship.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 並び替え */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 順序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">順序</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!filters.sortBy}
              >
                {SORT_ORDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* フィルター結果とクリアボタン */}
          {activeFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredPeople.length}件の結果
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                フィルターをクリア
              </button>
            </div>
          )}
        </div>

        {/* 補助情報 */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <p>
            <svg className="w-4 h-4 inline mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            旅行相手を登録しておくと、旅行記録作成時に選択できるようになります
          </p>
        </div>

        {/* 登録済み相手数 */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-800">
            <svg className="w-5 h-5 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            登録済み相手
            <span className="text-sm text-gray-500 font-normal ml-2">
              （{filteredPeople.length}人）
            </span>
          </h3>
        </div>

        {/* 旅行相手一覧 */}
        {filteredPeople.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                className="bg-white shadow-md rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                onClick={() => router.push(`/tripPeople/${person.id}`)}
                style={{ width: '100%', maxWidth: '250px', margin: '0 auto' }}
              >
                {/* プロフィール画像エリア */}
                <div className="h-32 relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 相手情報 */}
                <div className="p-4">
                  {/* 名前 */}
                  <h4 className="text-lg font-bold text-gray-800 mb-2 truncate">
                    {person.name}
                  </h4>

                  {/* 関係性 */}
                  <div className="flex items-center text-sm mb-2">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-600">
                      {getRelationshipName(person.relationship_id)}
                    </span>
                  </div>

                  {/* 誕生日 */}
                  {person.birthday && (
                    <div className="flex items-center text-sm mb-2">
                      <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 013 15.546V12a9 9 0 1118 0v3.546zM7.5 10.5L9 12l-1.5 1.5zM16.5 10.5L15 12l1.5 1.5z" />
                      </svg>
                      <span className="text-gray-600">
                        {formatDate(person.birthday)}
                        {calculateAge(person.birthday) && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({calculateAge(person.birthday)}歳)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* 好きなもの */}
                  {person.likes && (
                    <div className="flex items-start text-sm mb-3">
                      <svg className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="text-gray-600 line-clamp-2">
                        {person.likes.length > 40 ? `${person.likes.substring(0, 40)}...` : person.likes}
                      </span>
                    </div>
                  )}

                  {/* 登録日 */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>登録日</span>
                      <span>{formatDate(person.created_at || '')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 空状態 */
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFilters ? '条件に一致する旅行相手が見つかりませんでした' : '旅行相手が登録されていません'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {activeFilters 
                ? '検索条件を変更するか、フィルターをクリアしてお試しください。' 
                : '最初の旅行相手を登録して、旅行記録の管理を始めましょう。'
              }
            </p>
            <div className="space-x-4">
              {activeFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  すべて表示
                </button>
              )}
              <Link
                href="/tripPeople/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {activeFilters ? '新しい相手を登録' : '最初の相手を登録'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}