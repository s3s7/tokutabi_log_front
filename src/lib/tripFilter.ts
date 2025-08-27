import type { TripPerson } from '@/types/tripPeople';
import type { FilterState } from '@/types/filterState';
import { sortTripPeople } from './tripSort';

export const filterTripPeople = (people: TripPerson[], filters: FilterState): TripPerson[] => {
  let filtered = [...people];

  // 検索フィルター
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(person => 
      person.name.toLowerCase().includes(searchTerm) ||
      person.likes?.toLowerCase().includes(searchTerm) ||
      person.dislikes?.toLowerCase().includes(searchTerm) ||
      person.address?.toLowerCase().includes(searchTerm) ||
      person.memo?.toLowerCase().includes(searchTerm)
    );
  }

  // 関係性フィルター
  if (filters.relationshipId.trim()) {
    const relationshipId = Number(filters.relationshipId);
    if (!isNaN(relationshipId)) {
      filtered = filtered.filter(person => 
        person.relationship_id === relationshipId
      );
    }
  }

  // ソート処理
  if (filters.sortBy) {
    filtered = sortTripPeople(filtered, filters.sortBy, filters.sortOrder);
  }

  return filtered;
};

export const hasActiveFilters = (filters: FilterState): boolean => {
  return !!(
    filters.search.trim() || 
    filters.relationshipId.trim() || 
    filters.sortBy.trim()
  );
};

export const createEmptyFilterState = (): FilterState => ({
  search: '',
  relationshipId: '',
  sortBy: '' as const,
  sortOrder: 'desc'
});