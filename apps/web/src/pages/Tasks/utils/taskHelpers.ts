import { EARTH_RADIUS_KM } from '../../../constants/locations';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km`;
  } else {
    return `${Math.round(km)}km`;
  }
};

/**
 * Format time ago - compact version (for UI badges)
 * Returns: "Just now", "5m", "3h", "12d", "Jan 4"
 */
export const formatTimeAgo = (
  dateString: string,
  t?: (key: string, fallback: string) => string
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t ? t('tasks.time.justNow', 'Just now') : 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/**
 * Format time ago - long/human-readable version (for share messages)
 * Returns: "just now", "5 minutes ago", "3 hours ago", "12 days ago"
 */
export const formatTimeAgoLong = (
  dateString: string,
  t?: (key: string, fallback: string) => string
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t ? t('tasks.time.justNow', 'just now') : 'just now';
  if (diffMins === 1) return t ? t('tasks.time.oneMinAgo', '1 minute ago') : '1 minute ago';
  if (diffMins < 60) return t ? t('tasks.time.minsAgo', `${diffMins} minutes ago`).replace('{{count}}', String(diffMins)) : `${diffMins} minutes ago`;
  if (diffHours === 1) return t ? t('tasks.time.oneHourAgo', '1 hour ago') : '1 hour ago';
  if (diffHours < 24) return t ? t('tasks.time.hoursAgo', `${diffHours} hours ago`).replace('{{count}}', String(diffHours)) : `${diffHours} hours ago`;
  if (diffDays === 1) return t ? t('tasks.time.oneDayAgo', '1 day ago') : '1 day ago';
  if (diffDays < 30) return t ? t('tasks.time.daysAgo', `${diffDays} days ago`).replace('{{count}}', String(diffDays)) : `${diffDays} days ago`;
  if (diffDays < 60) return t ? t('tasks.time.oneMonthAgo', '1 month ago') : '1 month ago';
  const diffMonths = Math.floor(diffDays / 30);
  return t ? t('tasks.time.monthsAgo', `${diffMonths} months ago`).replace('{{count}}', String(diffMonths)) : `${diffMonths} months ago`;
};
