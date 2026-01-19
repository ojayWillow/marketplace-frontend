// User types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Listing types
export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
  location: string;
  images?: string[];
  user_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
  views?: number;
  is_active: boolean;
}

export type ListingCategory = 
  | 'electronics'
  | 'vehicles'
  | 'property'
  | 'furniture'
  | 'clothing'
  | 'sports'
  | 'books'
  | 'other';

export type ListingCondition = 
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'poor';

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
  location: string;
}

export interface ListingsFilter {
  category?: ListingCategory;
  condition?: ListingCondition;
  min_price?: number;
  max_price?: number;
  location?: string;
  search?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
