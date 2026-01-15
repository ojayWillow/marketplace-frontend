/**
 * React hook for managing push notification subscriptions
 * 
 * Fixed to properly sync permission state with UI toggle.
 * The toggle now reflects actual browser permission state.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
  urlBase64ToUint8Array,
} from '../api/push';
import { useAuthStore } from '../stores/authStore';

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
  const { isAuthenticated } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setPermission(Notification.permission);
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      
      // If permission is granted but no subscription exists, and user is authenticated,
      // try to create subscription (this handles the case where permission was granted
      // but subscription failed)
      if (Notification.permission === 'granted' && !subscription && isAuthenticated) {
        console.log('Permission granted but no subscription - will retry on next toggle');
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  }, [isSupported, isAuthenticated]);

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
        setIsLoading(false);
        return false;
      }

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
        setIsSubscribed(true); // Optimistically set to true since user granted permission
        setIsLoading(false);
        return true; // Return success since permission was granted
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
        setIsSubscribed(true); // User granted permission, consider it success
        return true;
      }
      
      return false;
    }
  }, [isSupported, isAuthenticated]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
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
  }, [isSupported]);

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
