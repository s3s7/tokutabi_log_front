'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { TripPersonFormData, TripPersonValidationErrors } from '@/types/tripPeople';
import { RELATIONSHIPS } from '@/constants/relationship';
import { 
  TRIP_PERSON_FORM_LIMITS, 
  AVATAR_CONFIG, 
  TRIP_PERSON_VALIDATION_MESSAGES 
} from '@/constants/tripPeople';
import { useToastContext } from '@/app/context/ToastContext';

export default function NewTripPersonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastContext();
  
  const [formData, setFormData] = useState<TripPersonFormData>({
    name: '',
    relationship_id: '',
    birthday: '',
    likes: '',
    dislikes: '',
    address: '',
    memo: '',
    avatar: null,
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<TripPersonValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 認証チェック
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // エラークリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック
      if (file.size > AVATAR_CONFIG.MAX_FILE_SIZE) {
        const errorMessage = TRIP_PERSON_VALIDATION_MESSAGES.AVATAR_FILE_SIZE;
        setErrors(prev => ({ ...prev, avatar: errorMessage }));
        showError(errorMessage);
        return;
      }
      
      // ファイル形式チェック
      if (!AVATAR_CONFIG.ACCEPTED_FORMATS.includes(file.type as any)) {
        const errorMessage = TRIP_PERSON_VALIDATION_MESSAGES.AVATAR_FILE_FORMAT;
        setErrors(prev => ({ ...prev, avatar: errorMessage }));
        showError(errorMessage);
        return;
      }
      
      setFormData(prev => ({ ...prev, avatar: file }));
      setErrors(prev => ({ ...prev, avatar: '' }));
      
      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: TripPersonValidationErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = TRIP_PERSON_VALIDATION_MESSAGES.NAME_REQUIRED;
    } else if (formData.name.length > TRIP_PERSON_FORM_LIMITS.NAME_MAX_LENGTH) {
      newErrors.name = TRIP_PERSON_VALIDATION_MESSAGES.NAME_MAX_LENGTH;
    }
    
    if (!formData.relationship_id) {
      newErrors.relationship_id = TRIP_PERSON_VALIDATION_MESSAGES.RELATIONSHIP_REQUIRED;
    }
    
    if (formData.likes.length > TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH) {
      newErrors.likes = TRIP_PERSON_VALIDATION_MESSAGES.LIKES_MAX_LENGTH;
    }
    
    if (formData.dislikes.length > TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH) {
      newErrors.dislikes = TRIP_PERSON_VALIDATION_MESSAGES.DISLIKES_MAX_LENGTH;
    }
    
    if (formData.address.length > TRIP_PERSON_FORM_LIMITS.ADDRESS_MAX_LENGTH) {
      newErrors.address = TRIP_PERSON_VALIDATION_MESSAGES.ADDRESS_MAX_LENGTH;
    }
    
    if (formData.memo.length > TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH) {
      newErrors.memo = TRIP_PERSON_VALIDATION_MESSAGES.MEMO_MAX_LENGTH;
    }
    
    setErrors(newErrors);
    
    // バリデーションエラーがある場合、最初のエラーをトーストで表示
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorMessage = newErrors[errorKeys[0]];
      showError(firstErrorMessage);
    }
    
    return errorKeys.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // TODO: バックエンドAPIが実装されたら、実際のAPI呼び出しを行う
      // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // const formDataToSend = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (value !== null && value !== '') {
      //     formDataToSend.append(key, value);
      //   }
      // });
      // const response = await axios.post(`${apiUrl}/api/v1/trip_people`, formDataToSend);
      
      // 暫定的な成功シミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const successMessage = '旅行相手を登録しました！';
      setSuccessMessage(successMessage);
      showSuccess(successMessage);
      
      // 3秒後に一覧ページに遷移
      setTimeout(() => {
        router.push('/tripPeople');
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = TRIP_PERSON_VALIDATION_MESSAGES.FORM_ERROR;
      setErrors({ form: errorMessage });
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link 
                href="/tripPeople"
                className="mr-4 text-gray-600 hover:text-gray-800 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                <svg className="w-6 h-6 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                旅行相手の追加
              </h1>
            </div>
          </div>
          
          {/* 説明文 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">旅行相手について</h3>
                <p className="mt-1 text-sm text-blue-700">
                  旅行相手を登録しておくと、旅行記録作成時に簡単に選択でき、その人の好みや過去の旅行履歴を参考にできます。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  <svg className="w-5 h-5 inline mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  基本情報
                </h3>
                <p className="text-sm text-gray-600">
                  旅行を一緒にする相手の基本的な情報を入力してください。
                </p>
              </div>

              {/* 成功メッセージ */}
              {successMessage && (
                <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="text-sm text-green-800">{successMessage}</div>
                  </div>
                </div>
              )}

              {/* フォームエラー */}
              {errors.form && (
                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
                  <div className="text-sm text-red-800">{errors.form}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* 名前 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="例：田中太郎、花子さん、おじいちゃんなど"
                    maxLength={TRIP_PERSON_FORM_LIMITS.NAME_MAX_LENGTH}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    旅行相手の名前またはニックネームを入力してください（必須）
                  </p>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* プロフィール画像 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    プロフィール画像
                  </label>
                  
                  <div className="flex items-start gap-5">
                    {/* 画像プレビュー */}
                    <div className="relative">
                      <div className="w-20 h-20 border-2 border-gray-200 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="プレビュー"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept={AVATAR_CONFIG.ACCEPTED_FORMATS.join(',')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={resetAvatar}
                          className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          選択をリセット
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {AVATAR_CONFIG.ACCEPTED_FORMATS_TEXT}形式のファイルをアップロードできます（最大{AVATAR_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB、任意）
                  </p>
                  {errors.avatar && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.avatar}
                    </p>
                  )}
                </div>

                {/* 関係性 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    関係性 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="relationship_id"
                    value={formData.relationship_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.relationship_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">関係性を選択してください</option>
                    {RELATIONSHIPS.map(relationship => (
                      <option key={relationship.id} value={relationship.id}>
                        {relationship.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    この相手との関係性を選択してください（必須）
                  </p>
                  {errors.relationship_id && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.relationship_id}
                    </p>
                  )}
                </div>

                {/* 誕生日 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    誕生日
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    誕生日を入力すると、旅行時期の参考になります（任意）
                  </p>
                </div>

                {/* 好きなもの */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    好きなもの・趣味
                  </label>
                  <textarea
                    name="likes"
                    value={formData.likes}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                      errors.likes ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="例：読書、映画鑑賞、スイーツ、花、アクセサリーなど"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      相手の好きなものや趣味を記録しておくと、旅行先選びの参考になります（任意）
                    </p>
                    <span className="text-xs text-gray-500">{formData.likes.length}/{TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH}文字</span>
                  </div>
                  {errors.likes && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.likes}
                    </p>
                  )}
                </div>

                {/* 苦手なもの */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    苦手なもの・アレルギー
                  </label>
                  <textarea
                    name="dislikes"
                    value={formData.dislikes}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                      errors.dislikes ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="例：辛いもの、香りの強いもの、特定の食材アレルギーなど"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      相手の苦手なものやアレルギーを記録して、適切な旅行先選びに役立てましょう（任意）
                    </p>
                    <span className="text-xs text-gray-500">{formData.dislikes.length}/{TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH}文字</span>
                  </div>
                  {errors.dislikes && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.dislikes}
                    </p>
                  )}
                </div>

                {/* 住所 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={TRIP_PERSON_FORM_LIMITS.ADDRESS_MAX_LENGTH}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="例：東京都新宿区西新宿x-x-x、〒xxx-xxxxx"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      相手の住所を記録しておくと、待ち合わせ場所として便利です（任意）
                    </p>
                    <span className="text-xs text-gray-500">{formData.address.length}/{TRIP_PERSON_FORM_LIMITS.ADDRESS_MAX_LENGTH}文字</span>
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* メモ */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メモ
                  </label>
                  <textarea
                    name="memo"
                    value={formData.memo}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                      errors.memo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="相手に関するその他のメモ、過去の旅行の反応、特記事項など..."
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      相手に関する自由なメモを記録してください（任意）
                    </p>
                    <span className="text-xs text-gray-500">{formData.memo.length}/{TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH}文字</span>
                  </div>
                  {errors.memo && (
                    <p className="mt-1 text-xs text-red-600">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {errors.memo}
                    </p>
                  )}
                </div>

                {/* ボタン */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-md font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        登録中...
                      </>
                    ) : (
                      '旅行相手を登録'
                    )}
                  </button>
                  
                  <Link
                    href="/tripPeople"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    キャンセル
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* サイドバー（ヒント） */}
          <div className="lg:w-80 xl:w-96">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  <svg className="w-5 h-5 inline mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  入力のヒント
                </h4>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="border-l-4 border-blue-300 pl-3">
                    <strong className="text-gray-800">名前</strong><br />
                    本名でもニックネームでも構いません。識別しやすい名前を入力してください。
                  </div>
                  
                  <div className="border-l-4 border-green-300 pl-3">
                    <strong className="text-gray-800">関係性</strong><br />
                    家族、友人、同僚など、その人との関係を選択してください。
                  </div>
                  
                  <div className="border-l-4 border-purple-300 pl-3">
                    <strong className="text-gray-800">好きなもの</strong><br />
                    趣味、好きな色、食べ物、観光スポットなど、旅行先選びの参考になる情報を記録しましょう。
                  </div>
                  
                  <div className="border-l-4 border-red-300 pl-3">
                    <strong className="text-gray-800">苦手なもの</strong><br />
                    アレルギーや嫌いなものを記録して、適切な旅行先選びに役立てましょう。
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    ここで入力した情報は、あなたのアカウントでのみ利用され、他のユーザーには公開されません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}