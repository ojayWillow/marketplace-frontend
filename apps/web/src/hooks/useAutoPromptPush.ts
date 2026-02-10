/**
 * Hook to auto-prompt push notification permission on app load.
 * 
 * Runs once per user session when:
 * - User is authenticated
 * - Browser supports notifications (Notification API exists)
 * - User hasn't been prompted before (tracked via localStorage)
 * - Notification permission is still 'default' (not granted/denied)
 * 
 * Note: On iOS Safari (not PWA), PushManager is not available but
 * we still skip gracefully. The SettingsTab will show install instructions.
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@marketplace/shared';

const PROMPT_KEY_PREFIX = 'push_prompt_shown';

export function useAutoPromptPush() {
  const { isAuthenticated, user } = useAuthStore();
  const hasPrompted = useRef(false);

  useEffect(() => {
    // Must be authenticated
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // Don't run twice
    if (hasPrompted.current) {
      return;
    }

    // Notification API must exist
    if (typeof Notification === 'undefined') {
      return;
    }

    const storageKey = `${PROMPT_KEY_PREFIX}_${user.id}`;
    const alreadyPrompted = localStorage.getItem(storageKey);

    if (alreadyPrompted) {
      return;
    }

    const currentPermission = Notification.permission;

    // Only prompt if permission is 'default' (never asked)
    if (currentPermission !== 'default') {
      localStorage.setItem(storageKey, 'true');
      return;
    }

    // Check if full push stack is available (service worker + PushManager)
    const hasPushSupport = 'serviceWorker' in navigator && 'PushManager' in window;

    if (!hasPushSupport) {
      // On iOS Safari or unsupported browsers, don't auto-prompt.
      // The SettingsTab will show install instructions instead.
      console.info('[AutoPromptPush] PushManager not available — skipping auto-prompt. User can enable via Settings.');
      return;
    }

    hasPrompted.current = true;

    // Small delay so UI renders first
    const timer = setTimeout(async () => {
      try {
        // Just request the permission — the actual subscription
        // will happen when user visits Settings and toggles on,
        // or we can auto-subscribe if they grant permission
        const result = await Notification.requestPermission();
        console.info('[AutoPromptPush] Permission result:', result);

        if (result === 'granted') {
          // Try to auto-subscribe via the push hook
          try {
            const { getVapidPublicKey, subscribeToPush, urlBase64ToUint8Array } = await import('@marketplace/shared');
            const vapidKey = await getVapidPublicKey();
            
            if (vapidKey) {
              const registration = await navigator.serviceWorker.ready;
              let subscription = await registration.pushManager.getSubscription();
              
              if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
              }
              
              await subscribeToPush(subscription);
              console.info('[AutoPromptPush] Auto-subscribed successfully');
            }
          } catch (subErr) {
            console.warn('[AutoPromptPush] Permission granted but subscription failed:', subErr);
          }
        }
      } catch (err) {
        console.warn('[AutoPromptPush] Failed to request permission:', err);
      } finally {
        localStorage.setItem(storageKey, 'true');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.id]);
}
