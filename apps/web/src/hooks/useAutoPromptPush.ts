/**
 * Hook to auto-prompt push notification permission on app load.
 * 
 * Runs once per user session when:
 * - User is authenticated
 * - Browser supports notifications
 * - User hasn't been prompted before (tracked via localStorage)
 * - Notification permission is still 'default' (not granted/denied)
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@marketplace/shared';
import { usePushNotifications } from './usePushNotifications';

const PROMPT_KEY_PREFIX = 'push_prompt_shown';

export function useAutoPromptPush() {
  const { isAuthenticated, user } = useAuthStore();
  const { isSupported, subscribe } = usePushNotifications();
  const hasPrompted = useRef(false);

  useEffect(() => {
    // Guards
    if (!isAuthenticated || !user?.id || !isSupported || hasPrompted.current) {
      return;
    }

    const storageKey = `${PROMPT_KEY_PREFIX}_${user.id}`;
    const alreadyPrompted = localStorage.getItem(storageKey);

    if (alreadyPrompted) {
      return;
    }

    // Check current permission state
    if (typeof Notification === 'undefined') {
      return;
    }

    const currentPermission = Notification.permission;

    // Only prompt if permission is 'default' (never asked)
    if (currentPermission !== 'default') {
      // Already granted or denied - mark as shown
      localStorage.setItem(storageKey, 'true');
      return;
    }

    // Small delay to let the app render first, then prompt
    hasPrompted.current = true;
    const timer = setTimeout(async () => {
      try {
        await subscribe();
      } catch (err) {
        console.warn('[AutoPromptPush] Failed to subscribe:', err);
      } finally {
        localStorage.setItem(storageKey, 'true');
      }
    }, 2000); // 2 second delay so UI loads first

    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.id, isSupported, subscribe]);
}
