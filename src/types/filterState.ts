import type { SortBy, SortOrder } from '@/constants/sort';

export type FilterState = {
  search: string;
  relationshipId: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
};
