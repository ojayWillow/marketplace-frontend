// User types
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  phone?: string
}

// Listing types
export interface Listing {
  id: number
  title: string
  description: string
  price: number
  category: string
  location: string
  contact_info?: string
  user_id: number
  user?: User
  created_at: string
  updated_at: string
}

export interface CreateListingData {
  title: string
  description: string
  price: number
  category: string
  location: string
  contact_info?: string
}

// API Response types
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}
