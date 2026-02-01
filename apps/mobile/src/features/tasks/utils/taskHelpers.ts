/**
 * Task Detail Helper Functions
 * Extracted from app/task/[id].tsx for reusability and maintainability
 */

export interface DifficultyIndicator {
  color: string;
  label: string;
}

export interface TimeTranslations {
  justNow?: string;
  minutesAgo?: string;
  hoursAgo?: string;
  daysAgo?: string;
}

/**
 * Format a date string into a human-readable relative time
 * e.g., "Just now", "5m ago", "2h ago", "3d ago"
 * @param dateString - ISO date string
 * @param timeTranslations - Optional translations for time formatting
 */
export const formatTimeAgo = (
  dateString: string | undefined,
  timeTranslations?: TimeTranslations
): string => {
  if (!dateString) return '';
  
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Helper to replace {{count}} with actual number
  const format = (template: string, count: number): string => {
    return template.replace('{{count}}', String(count));
  };
  
  if (diffMins < 1) {
    return timeTranslations?.justNow || 'Just now';
  }
  if (diffMins < 60) {
    const template = timeTranslations?.minutesAgo || '{{count}}m ago';
    return format(template, diffMins);
  }
  if (diffHours < 24) {
    const template = timeTranslations?.hoursAgo || '{{count}}h ago';
    return format(template, diffHours);
  }
  if (diffDays < 7) {
    const template = timeTranslations?.daysAgo || '{{count}}d ago';
    return format(template, diffDays);
  }
  
  return past.toLocaleDateString();
};

/**
 * Get difficulty indicator color and label based on task difficulty
 * @param difficulty - The difficulty level of the task
 * @param t - Optional translations object for localized labels
 */
export const getDifficultyIndicator = (
  difficulty: 'easy' | 'medium' | 'hard' | undefined,
  t?: any
): DifficultyIndicator => {
  switch (difficulty) {
    case 'easy':
      return { color: '#10b981', label: t?.difficulty?.easy || 'Easy' };
    case 'hard':
      return { color: '#ef4444', label: t?.difficulty?.hard || 'Hard' };
    default:
      return { color: '#f59e0b', label: t?.difficulty?.medium || 'Medium' };
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
