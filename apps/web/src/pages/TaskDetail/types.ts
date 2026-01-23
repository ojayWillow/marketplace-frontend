import { Task } from '@marketplace/shared';

export interface Review {
  id: number;
  rating: number;
  content: string;
  reviewer_id: number;
  reviewed_user_id: number;
  review_type: string;
  created_at: string;
  reviewer?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
  reviewed_user?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  review_type?: string;
  reviewee?: {
    id: number;
    username: string;
    profile_picture_url?: string;
  };
  existing_review?: Review;
}

export interface TaskDetailProps {
  task: Task;
  isCreator: boolean;
  isAssigned: boolean;
  isAuthenticated: boolean;
  userId?: number;
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'open': 'Open',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'pending_confirmation': 'Pending',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'disputed': 'Disputed',
  };
  return labels[status] || status;
};

export const getDifficultyLabel = (priority: string): string => {
  const map: Record<string, string> = {
    'low': 'Easy',
    'easy': 'Easy',
    'normal': 'Medium',
    'medium': 'Medium',
    'high': 'Hard',
    'hard': 'Hard',
  };
  return map[priority?.toLowerCase()] || 'Medium';
};
