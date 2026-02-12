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
 * Share a task via the Web Share API (mobile) or copy to clipboard (desktop).
 *
 * The shared message includes:
 * - Title
 * - Price (€)
 * - Location (short)
 * - Deep link URL → opens map with bubble selected
 */
export const shareTask = async (task: Task): Promise<'shared' | 'copied' | 'dismissed'> => {
  const budget = task.budget || task.reward || 0;
  const address = shortAddress(task.location);
  const url = buildShareUrl(task.id);

  const lines: string[] = [];
  lines.push(task.title);
  if (budget > 0) lines.push(`💰 €${budget}`);
  if (address) lines.push(`📍 ${address}`);
  lines.push('');
  lines.push(url);

  const text = lines.join('\n');

  // Try native share (works on mobile browsers)
  if (navigator.share) {
    try {
      await navigator.share({ title: task.title, text, url });
      return 'shared';
    } catch (err: any) {
      // User cancelled the share dialog
      if (err?.name === 'AbortError') return 'dismissed';
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    // Last resort: textarea hack
    const textarea = document.createElement('textarea');
    textarea.value = text;
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
