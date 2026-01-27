/**
 * Format a date string to a relative time (e.g., "5m ago", "2h ago")
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

/**
 * Format a date string to a short date (e.g., "24 Jan")
 */
export const formatPostedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
};

/**
 * Get difficulty indicator with color and label
 */
export const getDifficultyIndicator = (
  difficulty: 'easy' | 'medium' | 'hard' | undefined
): { color: string; label: string } => {
  switch (difficulty) {
    case 'easy': return { color: '#10b981', label: 'Easy' };
    case 'hard': return { color: '#ef4444', label: 'Hard' };
    case 'medium':
    default: return { color: '#f59e0b', label: 'Medium' };
  }
};

/**
 * Get zoom level based on map latitude delta
 */
export type ZoomLevel = 'far' | 'mid' | 'close';

export const getZoomLevel = (latitudeDelta: number | undefined): ZoomLevel => {
  const ZOOM_FAR_THRESHOLD = 0.12;
  const ZOOM_CLOSE_THRESHOLD = 0.05;
  
  if (!latitudeDelta) return 'mid';
  if (latitudeDelta > ZOOM_FAR_THRESHOLD) return 'far';
  if (latitudeDelta <= ZOOM_CLOSE_THRESHOLD) return 'close';
  return 'mid';
};
