// User types
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  city?: string
  country?: string
  is_verified?: boolean
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

// Seller info for listing detail view
export interface SellerInfo {
  id: number
  username: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  city?: string
  country?: string
  is_verified: boolean
  average_rating?: number
  reviews_count?: number
  completion_rate?: number
  created_at?: string
}

// Listing types
export interface Listing {
  id: number
  title: string
  description: string
  price: number
  currency?: string
  category: string
  subcategory?: string
  condition?: string // 'new', 'like_new', 'used', 'refurbished'
  location?: string
  latitude?: number
  longitude?: number
  contact_info?: string
  images?: string // Comma-separated image paths
  image_urls?: string[] // Legacy: Array of image URLs
  tags?: string[]
  views_count?: number
  listing_type?: string // 'sale', 'purchase', 'exchange'
  status: string // 'active', 'sold', 'archived', 'pending'
  is_featured?: boolean
  is_negotiable?: boolean
  user_id: number
  seller_id?: number
  seller?: string // Username for quick display
  seller_info?: SellerInfo // Full seller details for detail view
  created_at: string
  updated_at?: string
  expires_at?: string
}

export interface CreateListingData {
  title: string
  description: string
  price: number
  category: string
  subcategory?: string
  condition?: string
  location?: string
  latitude?: number
  longitude?: number
  contact_info?: string
  images?: string
  is_negotiable?: boolean
}

// Task types
export interface Task {
  id: number
  title: string
  description: string
  budget: number
  category: string
  location?: string
  latitude?: number
  longitude?: number
  status: string // 'open', 'assigned', 'in_progress', 'completed', 'cancelled'
  poster_id: number
  poster?: User
  assignee_id?: number
  assignee?: User
  due_date?: string
  created_at: string
  updated_at?: string
}

export interface CreateTaskData {
  title: string
  description: string
  budget: number
  category: string
  location?: string
  latitude?: number
  longitude?: number
  due_date?: string
}

// Review types
export interface Review {
  id: number
  rating: number
  content?: string
  reviewer_id: number
  reviewer_name?: string
  reviewer_avatar?: string
  reviewee_id: number
  review_type?: string // 'task', 'listing'
  task_id?: number
  listing_id?: number
  created_at: string
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
