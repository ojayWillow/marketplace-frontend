import { WorkItem } from './types';

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDifficultyColor = (difficulty?: string): string => {
  const diff = difficulty?.toLowerCase();
  if (diff === 'easy') return 'text-green-600';
  if (diff === 'hard') return 'text-red-600';
  return 'text-yellow-600';
};

export const mapTask = (task: any): WorkItem => ({
  id: task.id,
  type: 'job',
  title: task.title,
  description: task.description,
  category: task.category,
  budget: task.budget || task.reward,
  creator_name: task.creator_name,
  created_at: task.created_at,
  location: task.location,
  latitude: task.latitude,
  longitude: task.longitude,
  difficulty: task.difficulty,
  creator_rating: task.creator_rating,
  creator_review_count: task.creator_review_count,
  is_urgent: task.is_urgent,
});

export const mapOffering = (offering: any): WorkItem => ({
  id: offering.id,
  type: 'service',
  title: offering.title,
  description: offering.description,
  category: offering.category,
  price: offering.price,
  creator_name: offering.creator_name,
  created_at: offering.created_at,
  location: offering.location,
  latitude: offering.latitude,
  longitude: offering.longitude,
  difficulty: offering.difficulty,
  creator_rating: offering.creator_rating,
  creator_review_count: offering.creator_review_count,
});

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message === 'Network Error' || error.message.includes('ERR_NETWORK')) {
      return 'Cannot reach server. Check your connection or try again later.';
    }
    if (error.message.includes('timeout')) {
      return 'Server took too long to respond. Please try again.';
    }
    if ((error as any).response) {
      const status = (error as any).response.status;
      if (status === 500) return 'Server error (500). The backend may be down.';
      if (status === 502) return 'Bad gateway (502). The backend may be restarting.';
      if (status === 503) return 'Service unavailable (503). Try again in a moment.';
      if (status === 404) return 'API endpoint not found (404). Check backend deployment.';
      return `Server returned error ${status}.`;
    }
    return error.message;
  }
  return 'An unexpected error occurred.';
};

/**
 * Format item distance for display
 * Prioritizes showing calculated distance over location name
 */
export const formatItemDistance = (distance: number | undefined, location?: string): string => {
  // If we have a calculated distance, show it
  if (distance !== undefined) {
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${distance.toFixed(1)}km away`;
  }
  // Fallback to location name if no distance available
  if (location) {
    const cityName = location.split(',')[0].trim();
    return cityName;
  }
  return 'Location unknown';
};
