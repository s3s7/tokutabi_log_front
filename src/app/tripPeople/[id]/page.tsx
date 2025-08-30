'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { useToastContext } from '@/app/context/ToastContext';
import type { TripPerson, TripPersonFormData, TripPersonValidationErrors } from '@/types/tripPeople';
import { RELATIONSHIPS } from '@/constants/relationship';
import {
  TRIP_PERSON_FORM_LIMITS,
  TRIP_PERSON_VALIDATION_MESSAGES
} from '@/constants/tripPeople';


export default function TripPersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  
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
    loadingMessage: '旅行相手情報を読み込み中...',
    loadingSize: 'md',
    requiredRole: 1, // 一般ユーザー(1)以上のアクセス権限が必要
    onAuthError: handleAuthError,
    onUnauthorized: handleUnauthorized
  });

  // 状態管理
  const [tripPerson, setTripPerson] = useState<TripPerson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<TripPersonValidationErrors>({});
  
  // 編集用フォームデータ
  const [editFormData, setEditFormData] = useState<TripPersonFormData>({
    name: '',
    relationship_id: '',
    birthday: '',
    likes: '',
    dislikes: '',
    address: '',
    memo: '',
  });

  // パラメータからIDを取得
  const tripPersonId = params?.id as string;

  // 旅行相手データを取得する関数
  const fetchTripPerson = useCallback(async () => {
    if (!isAuthenticated || !user || !tripPersonId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/trip_people/${tripPersonId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Provider': 'google',
          'X-Auth-UID': user.id || user.email || '',
        }
      });

      if (response.ok) {
        const result = await response.json();
        const personData = result.trip_person || result;
        setTripPerson(personData);
        
        // 編集用フォームデータを初期化
        setEditFormData({
          name: personData.name || '',
          relationship_id: personData.relationship_id?.toString() || '',
          birthday: personData.birthday || '',
          likes: personData.likes || '',
          dislikes: personData.dislikes || '',
          address: personData.address || '',
          memo: personData.memo || '',
        });
      } else if (response.status === 404) {
        setError('指定された旅行相手が見つかりませんでした');
      } else {
        const result = await response.json();
        setError(result.error || '旅行相手データの取得に失敗しました');
      }
      
    } catch (error) {
      console.error('旅行相手データの取得に失敗しました:', error);
      setError('旅行相手データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, tripPersonId]);

  // 初回データ読み込み
  useEffect(() => {
    fetchTripPerson();
  }, [fetchTripPerson]);

  // 関係性名を取得する関数
  const getRelationshipName = (relationshipId: number) => {
    return RELATIONSHIPS.find(rel => rel.id === relationshipId)?.name || '未設定';
  };

  // 年齢計算関数
  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age > 0 ? age : null;
  };

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // フォーム入力値変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    // バリデーションエラーをクリア
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 編集モード切り替え
  const handleEditToggle = () => {
    if (isEditing) {
      // 編集キャンセル時は元データに戻す
      if (tripPerson) {
        setEditFormData({
          name: tripPerson.name || '',
          relationship_id: tripPerson.relationship_id?.toString() || '',
          birthday: tripPerson.birthday || '',
          likes: tripPerson.likes || '',
          dislikes: tripPerson.dislikes || '',
          address: tripPerson.address || '',
          memo: tripPerson.memo || '',
        });
      }
      setValidationErrors({});
    }
    setIsEditing(!isEditing);
  };

  // バリデーション関数
  const validateForm = (): boolean => {
    const errors: TripPersonValidationErrors = {};

    if (!editFormData.name.trim()) {
      errors.name = TRIP_PERSON_VALIDATION_MESSAGES.NAME_REQUIRED;
    } else if (editFormData.name.length > TRIP_PERSON_FORM_LIMITS.NAME_MAX_LENGTH) {
      errors.name = TRIP_PERSON_VALIDATION_MESSAGES.NAME_MAX_LENGTH;
    }

    if (!editFormData.relationship_id) {
      errors.relationship_id = TRIP_PERSON_VALIDATION_MESSAGES.RELATIONSHIP_REQUIRED;
    }

    if (editFormData.likes && editFormData.likes.length > TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH) {
      errors.likes = TRIP_PERSON_VALIDATION_MESSAGES.LIKES_MAX_LENGTH;
    }

    if (editFormData.dislikes && editFormData.dislikes.length > TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH) {
      errors.dislikes = TRIP_PERSON_VALIDATION_MESSAGES.DISLIKES_MAX_LENGTH;
    }

    if (editFormData.address && editFormData.address.length > TRIP_PERSON_FORM_LIMITS.ADDRESS_MAX_LENGTH) {
      errors.address = TRIP_PERSON_VALIDATION_MESSAGES.ADDRESS_MAX_LENGTH;
    }

    if (editFormData.memo && editFormData.memo.length > TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH) {
      errors.memo = TRIP_PERSON_VALIDATION_MESSAGES.MEMO_MAX_LENGTH;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 更新処理
  const handleUpdate = async () => {
    if (!validateForm()) {
      showError('入力内容に誤りがあります。確認してください。');
      return;
    }

    if (!isAuthenticated || !user || !tripPersonId) {
      showError('認証エラーが発生しました');
      return;
    }

    try {
      setIsSaving(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/trip_people/${tripPersonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Provider': 'google',
          'X-Auth-UID': user.id || user.email || '',
        },
        body: JSON.stringify({
          trip_person: {
            ...editFormData,
            relationship_id: parseInt(editFormData.relationship_id, 10),
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedPerson = result.trip_person || result;
        setTripPerson(updatedPerson);
        setIsEditing(false);
        showSuccess('旅行相手情報を更新しました');
      } else {
        const result = await response.json();
        console.error('更新エラー:', result.error);
        showError(result.error || '旅行相手情報の更新に失敗しました');
      }
      
    } catch (error) {
      console.error('旅行相手情報の更新に失敗しました:', error);
      showError('旅行相手情報の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!isAuthenticated || !user || !tripPersonId) {
      showError('認証エラーが発生しました');
      return;
    }

    try {
      setIsDeleting(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/trip_people/${tripPersonId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Provider': 'google',
          'X-Auth-UID': user.id || user.email || '',
        }
      });

      if (response.ok) {
        showSuccess('旅行相手を削除しました');
        router.push('/tripPeople');
      } else {
        const result = await response.json();
        console.error('削除エラー:', result.error);
        showError(result.error || '旅行相手の削除に失敗しました');
      }
      
    } catch (error) {
      console.error('旅行相手の削除に失敗しました:', error);
      showError('旅行相手の削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // 認証ガード - 認証が必要な場合はローディング画面やリダイレクトを自動処理
  const guardElement = renderGuard();
  if (guardElement) {
    return guardElement;
  }

  // データ読み込み中の場合
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">旅行相手情報を読み込み中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラーまたは404の場合
  if (error || !tripPerson) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || '旅行相手が見つかりません'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              指定された旅行相手の情報を読み込むことができませんでした。
            </p>
            <div className="space-x-4">
              <button
                onClick={() => fetchTripPerson()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                再読み込み
              </button>
              <Link
                href="/tripPeople"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/tripPeople"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                旅行相手一覧に戻る
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  編集
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                      </>
                    ) : (
                      '保存'
                    )}
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isEditing || isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                削除
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* プロフィール画像と基本情報 */}
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            maxLength={TRIP_PERSON_FORM_LIMITS.NAME_MAX_LENGTH}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="例：田中太郎"
                          />
                          {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-900">{tripPerson.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">関係性</label>
                      {isEditing ? (
                        <div>
                          <select
                            name="relationship_id"
                            value={editFormData.relationship_id}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors.relationship_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">関係性を選択してください</option>
                            {RELATIONSHIPS.map(relationship => (
                              <option key={relationship.id} value={relationship.id}>
                                {relationship.name}
                              </option>
                            ))}
                          </select>
                          {validationErrors.relationship_id && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.relationship_id}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-lg text-gray-700">{getRelationshipName(tripPerson.relationship_id)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-6">
                {/* 誕生日 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">誕生日</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={editFormData.birthday}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div>
                      {tripPerson.birthday ? (
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900">{formatDate(tripPerson.birthday)}</p>
                          {calculateAge(tripPerson.birthday) && (
                            <span className="text-sm text-gray-500">
                              ({calculateAge(tripPerson.birthday)}歳)
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">未設定</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 住所 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="address"
                        value={editFormData.address}
                        onChange={handleInputChange}
                        maxLength={TRIP_PERSON_FORM_LIMITS.ADDRESS_MAX_LENGTH}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="例：東京都渋谷区"
                      />
                      {validationErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{tripPerson.address || '未設定'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 好きなもの・嫌いなもの・メモ */}
            <div className="mt-8 space-y-6">
              <hr className="border-gray-200" />
              
              {/* 好きなもの */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">好きなもの</label>
                {isEditing ? (
                  <div>
                    <textarea
                      name="likes"
                      value={editFormData.likes}
                      onChange={handleInputChange}
                      maxLength={TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.likes ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="例：ラーメン、温泉、美術館巡り"
                    />
                    {validationErrors.likes && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.likes}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {editFormData.likes.length}/{TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH}文字
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {tripPerson.likes || '未設定'}
                    </p>
                  </div>
                )}
              </div>

              {/* 嫌いなもの */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">嫌いなもの</label>
                {isEditing ? (
                  <div>
                    <textarea
                      name="dislikes"
                      value={editFormData.dislikes}
                      onChange={handleInputChange}
                      maxLength={TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.dislikes ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="例：辛いもの、人混み、長時間の移動"
                    />
                    {validationErrors.dislikes && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.dislikes}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {editFormData.dislikes.length}/{TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH}文字
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {tripPerson.dislikes || '未設定'}
                    </p>
                  </div>
                )}
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                {isEditing ? (
                  <div>
                    <textarea
                      name="memo"
                      value={editFormData.memo}
                      onChange={handleInputChange}
                      maxLength={TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.memo ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="例：体力がないので長時間歩くのは苦手。カメラが趣味なので景色の良い場所を喜ぶ。"
                    />
                    {validationErrors.memo && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.memo}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {editFormData.memo.length}/{TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH}文字
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {tripPerson.memo || '未設定'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 登録日・更新日 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">登録日: </span>
                  {tripPerson.created_at && formatDate(tripPerson.created_at)}
                </div>
                <div>
                  <span className="font-medium">最終更新: </span>
                  {tripPerson.updated_at && formatDate(tripPerson.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">旅行相手を削除</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  「{tripPerson.name}」を削除してもよろしいですか？<br />
                  この操作は取り消すことができません。
                </p>
              </div>
              <div className="items-center px-4 py-3 space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      削除中...
                    </>
                  ) : (
                    '削除する'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}