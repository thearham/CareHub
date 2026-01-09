// User type - matches UserSerializer from backend
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  user_type: 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN';
  is_active: boolean;
  date_joined: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Generic API error response
export interface ApiError {
  detail?: string;
  message?: string;
  error?: string;
  [key: string]: string | string[] | undefined;
}