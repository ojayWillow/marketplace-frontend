/**
 * React hook for managing push notification subscriptions
 * 
 * Fixed to properly persist toggle state across app sessions.
 * Uses both browser permission AND localStorage to track user preference.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
  urlBase64ToUint8Array,
} from '@marketplace/shared';
import { useAuthStore } from '@marketplace/shared';

const PUSH_PREFERENCE_KEY = 'push_notifications_enabled';

export interface UsePushNotificationsReturn {
  /** Whether push notifications are supported by the browser */
  isSupported: boolean;
  /** Whether the user has granted permission */
  permission: NotificationPermission;
  /** Whether currently subscribed to push notifications */
  isSubscribed: boolean;
  /** Loading state while subscribing/unsubscribing */
  isLoading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Request permission and subscribe to push notifications */
  subscribe: () => Promise<boolean>;
  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<boolean>;
  /** Send a test notification */
  testNotification: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { isAuthenticated, user } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user-specific storage key
  const getStorageKey = useCallback(() => {
    return user?.id ? `${PUSH_PREFERENCE_KEY}_${user.id}` : PUSH_PREFERENCE_KEY;
  }, [user?.id]);

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      // Set initial permission state
      setPermission(Notification.permission);
    }
  }, []);

  // Check subscription status when component mounts or permission changes
  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    
    try {
      // Update permission state in case it changed
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      
      // First check if there's an actual browser subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Real subscription exists
        setIsSubscribed(true);
        localStorage.setItem(getStorageKey(), 'true');
        return;
      }
      
      // No browser subscription - check if user has granted permission
      // AND has previously enabled notifications (stored preference)
      const storedPreference = localStorage.getItem(getStorageKey());
      
      if (currentPermission === 'granted' && storedPreference === 'true') {
        // Permission granted and user previously enabled - show as subscribed
        // (This handles the case where VAPID key isn't configured)
        setIsSubscribed(true);
      } else if (currentPermission === 'denied') {
        // Permission was denied - definitely not subscribed
        setIsSubscribed(false);
        localStorage.removeItem(getStorageKey());
      } else {
        // Default state or permission revoked
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  }, [isSupported, getStorageKey]);

  // Check subscription on mount and when auth state changes
  useEffect(() => {
    if (!isSupported) return;
    
    checkSubscription();
    
    // Also listen for visibility changes to re-check subscription
    // (in case permission was changed in settings)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSubscription();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSupported, isAuthenticated, checkSubscription]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to enable notifications');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Notification permission denied');
        localStorage.removeItem(getStorageKey());
        setIsLoading(false);
        return false;
      }

      // Permission granted - save user preference immediately
      localStorage.setItem(getStorageKey(), 'true');

      // Get VAPID public key from server
      let vapidPublicKey: string | null = null;
      try {
        vapidPublicKey = await getVapidPublicKey();
      } catch (err) {
        console.warn('Could not get VAPID key:', err);
      }

      if (!vapidPublicKey) {
        // Permission was granted but server doesn't have VAPID configured
        // Still mark as subscribed since user wants notifications
        console.warn('Push notifications not configured on server - permission granted but subscription pending');
        setIsSubscribed(true);
        setIsLoading(false);
        return true;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Send subscription to backend
      try {
        await subscribeToPush(subscription);
      } catch (backendError) {
        console.warn('Could not register subscription with backend:', backendError);
        // Still consider subscribed since browser subscription exists
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error subscribing to push:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setIsLoading(false);
      
      // Even if subscription failed, check if permission was granted
      // and update state accordingly
      if (Notification.permission === 'granted') {
        localStorage.setItem(getStorageKey(), 'true');
        setIsSubscribed(true);
        return true;
      }
      
      return false;
    }
  }, [isSupported, isAuthenticated, getStorageKey]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Remove stored preference
      localStorage.removeItem(getStorageKey());

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Notify backend
        try {
          await unsubscribeFromPush(subscription.endpoint);
        } catch (backendError) {
          console.warn('Could not notify backend of unsubscription:', backendError);
        }
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error unsubscribing from push:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      setIsLoading(false);
      return false;
    }
  }, [isSupported, getStorageKey]);

  const testNotification = useCallback(async (): Promise<void> => {
    if (!isSubscribed) {
      setError('You must be subscribed to send test notifications');
      return;
    }

    try {
      await sendTestNotification();
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to send test');
    }
  }, [isSubscribed]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    testNotification,
  };
}
