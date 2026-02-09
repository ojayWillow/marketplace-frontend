// Profile page TypeScript interfaces

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  is_verified: boolean;
  reputation_score: number;
  completion_rate: number;
  reviews_count?: number;
  average_rating?: number;
  tasks_completed?: number;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  content?: string;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_avatar?: string;
  review_type?: string;
  created_at: string;
}

export interface TaskMatchCounts {
  [taskId: number]: number;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
  city: string;
  country: string;
  avatar_url: string;
}

export type ActiveTab = 'about' | 'listings' | 'offerings' | 'tasks' | 'reviews' | 'settings';
export type TaskViewMode = 'my-tasks' | 'my-jobs';
export type TaskStatusFilter = 'all' | 'active' | 'completed';
