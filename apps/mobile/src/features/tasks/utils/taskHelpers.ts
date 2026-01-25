/**
 * Task Detail Helper Functions
 * Extracted from app/task/[id].tsx for reusability and maintainability
 */

export interface DifficultyIndicator {
  color: string;
  label: string;
}

/**
 * Format a date string into a human-readable relative time
 * e.g., "Just now", "5m ago", "2h ago", "3d ago"
 */
export const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
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
  
  return past.toLocaleDateString();
};

/**
 * Get difficulty indicator color and label based on task difficulty
 */
export const getDifficultyIndicator = (
  difficulty: 'easy' | 'medium' | 'hard' | undefined
): DifficultyIndicator => {
  switch (difficulty) {
    case 'easy':
      return { color: '#10b981', label: 'Easy' };
    case 'hard':
      return { color: '#ef4444', label: 'Hard' };
    default:
      return { color: '#f59e0b', label: 'Medium' };
  }
};

/**
 * Parse task images string into array of URLs
 */
export const parseTaskImages = (
  images: string | undefined,
  getImageUrl: (url: string) => string
): string[] => {
  if (!images) return [];
  return images.split(',').filter(Boolean).map(url => getImageUrl(url));
};
