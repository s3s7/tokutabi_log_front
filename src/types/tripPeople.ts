export type TripPerson = {
  id?: number;
  name: string;
  relationship_id: number;
  relationship_name?: string;
  birthday?: string;
  age?: number;
  display_age?: string;
  likes?: string;
  dislikes?: string;
  address?: string;
  memo?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
};

export type TripPersonFormData = {
  name: string;
  relationship_id: string;
  birthday: string;
  likes: string;
  dislikes: string;
  address: string;
  memo: string;
};

export type TripPersonResponse = {
  trip_person: TripPerson;
  message: string;
};

export type TripPersonListResponse = {
  trip_people: TripPerson[];
  message?: string;
};

export type TripPersonError = {
  error: string;
  details?: Record<string, string[]>;
};

export type TripPersonValidationErrors = Record<string, string>;
