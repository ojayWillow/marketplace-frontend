// Profile tab types
export type ActiveTab = 'about' | 'tasks' | 'offerings' | 'reviews';
export type TaskViewMode = 'my-tasks' | 'my-jobs';
export type TaskStatusFilter = 'all' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// Profile data types used across components
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  phone_verified?: boolean;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  bio?: string;
  city?: string;
  country?: string;
  is_verified?: boolean;
  is_helper?: boolean;
  skills?: string;
  helper_categories?: string;
  hourly_rate?: number;
  reputation_score?: number;
  completion_rate?: number;
  average_rating?: number;
  reviews_count?: number;
  tasks_completed?: number;
  created_at: string;
  updated_at?: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  bio: string;
  city: string;
  country: string;
  phone: string;
  skills: string;
  hourly_rate: number | string;
  avatar_url?: string;
}
