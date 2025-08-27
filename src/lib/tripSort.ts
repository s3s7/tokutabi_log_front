import type { TripPerson } from '@/types/tripPeople';
import type { SortBy, SortOrder } from '@/constants/sort';

export const sortTripPeople = (
  people: TripPerson[], 
  sortBy: SortBy, 
  sortOrder: SortOrder
): TripPerson[] => {
  if (!sortBy) return people;
  
  const sorted = [...people];

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => {
        const compare = a.name.localeCompare(b.name, 'ja');
        return sortOrder === 'asc' ? compare : -compare;
      });
      break;

    case 'created_at':
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      break;

    case 'birthday':
      sorted.sort((a, b) => {
        // 誕生日が未設定の場合は最後に配置
        const dateA = new Date(a.birthday || '9999-12-31').getTime();
        const dateB = new Date(b.birthday || '9999-12-31').getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      break;

    case 'relationship':
      sorted.sort((a, b) => {
        const compare = a.relationship_id - b.relationship_id;
        return sortOrder === 'asc' ? compare : -compare;
      });
      break;

    default:
      break;
  }

  return sorted;
};
