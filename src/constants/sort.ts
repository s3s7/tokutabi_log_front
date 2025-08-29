export type SortBy = 'name' | 'created_at' | 'birthday' | 'relationship' | '';
export type SortOrder = 'asc' | 'desc';

export type SortOption = {
  value: SortBy;
  label: string;
};

export type SortOrderOption = {
  value: SortOrder;
  label: string;
};

export const SORT_OPTIONS: SortOption[] = [
  { value: '', label: '選択してください' },
  { value: 'name', label: '名前順' },
  { value: 'created_at', label: '登録日順' },
  { value: 'birthday', label: '誕生日順' },
  { value: 'relationship', label: '関係性順' }
] as const;

export const SORT_ORDER_OPTIONS: SortOrderOption[] = [
  { value: 'asc', label: '昇順' },
  { value: 'desc', label: '降順' }
] as const;
