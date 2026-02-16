import { Task } from '@marketplace/shared';

/**
 * Build the deep-link URL that opens the map with a specific job selected.
 * Format: https://<host>/?task=<taskId>
 */
const buildShareUrl = (taskId: number): string => {
  const base = window.location.origin;
  return `${base}/?task=${taskId}`;
};

/**
 * Format a short address from the full location string.
 * e.g. "Rīga, Centrs, Brīvības iela 100, LV-1001" → "Rīga, Centrs"
 */
const shortAddress = (location?: string): string => {
  if (!location) return '';
  return location.split(',').slice(0, 2).join(',').trim();
};

/**
 * Format a date string as relative time for share messages.
 * e.g. "Just now", "5m ago", "2h ago", "3d ago", or "15 Feb"
 */
const formatPostedTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/**
 * Share a task via the Web Share API (mobile) or copy to clipboard (desktop).
 *
 * The URL is included inline in the text body (with a blank line before it)
 * instead of as a separate `url` param. This ensures WhatsApp and other
 * apps display it on its own line rather than appending it to the last
 * text line.
 */
export const shareTask = async (task: Task): Promise<'shared' | 'copied' | 'dismissed'> => {
  const budget = task.budget || task.reward || 0;
  const address = shortAddress(task.location);
  const url = buildShareUrl(task.id);

  const textLines: string[] = [];
  textLines.push(task.title);
  if (budget > 0) textLines.push(`💰 €${budget}`);
  if (address) textLines.push(`📍 ${address}`);
  if (task.created_at) textLines.push(`🕐 Posted ${formatPostedTime(task.created_at)}`);

  // Always append URL on its own line with a blank line separator
  const fullText = textLines.join('\n') + '\n\n' + url;

  // Try native share — pass URL in the text body only, not as separate `url`.
  // When `url` is passed separately, WhatsApp concatenates it awkwardly
  // right after the last text line.
  if (navigator.share) {
    try {
      await navigator.share({ title: task.title, text: fullText });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') return 'dismissed';
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(fullText);
    return 'copied';
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return 'copied';
  }
};

export default shareTask;
