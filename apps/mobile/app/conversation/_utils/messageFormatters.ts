/**
 * Utility functions for formatting message-related data
 */

/**
 * Format last seen time in a human-readable format
 */
export function formatLastSeen(lastSeenStr: string | null): string {
  if (!lastSeenStr) return '';
  
  const lastSeen = new Date(lastSeenStr);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return lastSeen.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format message timestamp (e.g., "2:30 PM")
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for separator (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Check if two messages need a date separator between them
 */
export function needsDateSeparator(currentTimestamp: string, prevTimestamp?: string): boolean {
  if (!prevTimestamp) return true;
  const currentDate = new Date(currentTimestamp).toDateString();
  const prevDate = new Date(prevTimestamp).toDateString();
  return currentDate !== prevDate;
}
