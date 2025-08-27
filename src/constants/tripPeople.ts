


export const TRIP_PERSON_FORM_LIMITS = {
  NAME_MAX_LENGTH: 255,
  LIKES_MAX_LENGTH: 30,
  DISLIKES_MAX_LENGTH: 30,
  ADDRESS_MAX_LENGTH: 100,
  MEMO_MAX_LENGTH: 100,
} as const;

export const AVATAR_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  ACCEPTED_FORMATS_TEXT: 'JPEG、PNG、WEBP',
} as const;

export const TRIP_PERSON_FORM_FIELDS = {
  NAME: 'name',
  RELATIONSHIP_ID: 'relationship_id',
  BIRTHDAY: 'birthday',
  LIKES: 'likes',
  DISLIKES: 'dislikes',
  ADDRESS: 'address',
  MEMO: 'memo',
  AVATAR: 'avatar',
} as const;

export const TRIP_PERSON_VALIDATION_MESSAGES = {
  NAME_REQUIRED: '名前は必須です',
  NAME_MAX_LENGTH: `名前は${TRIP_PERSON_FORM_LIMITS.NAME_MAX_LENGTH}文字以下で入力してください`,
  RELATIONSHIP_REQUIRED: '関係性を選択してください',
  LIKES_MAX_LENGTH: `好きなものは${TRIP_PERSON_FORM_LIMITS.LIKES_MAX_LENGTH}文字以下で入力してください`,
  DISLIKES_MAX_LENGTH: `苦手なものは${TRIP_PERSON_FORM_LIMITS.DISLIKES_MAX_LENGTH}文字以下で入力してください`,
  ADDRESS_MAX_LENGTH: `住所は${TRIP_PERSON_FORM_LIMITS.ADDRESS_MAX_LENGTH}文字以下で入力してください`,
  MEMO_MAX_LENGTH: `メモは${TRIP_PERSON_FORM_LIMITS.MEMO_MAX_LENGTH}文字以下で入力してください`,
  AVATAR_FILE_SIZE: `ファイルサイズは${AVATAR_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB以下にしてください`,
  AVATAR_FILE_FORMAT: `${AVATAR_CONFIG.ACCEPTED_FORMATS_TEXT}形式のファイルをアップロードしてください`,
  FORM_ERROR: '登録に失敗しました。もう一度お試しください。',
} as const;
