/**
 * React hook for managing push notification subscriptions
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
      setPermission(Notification.permission);
    }
  }, []);

  // Check subscription status when component mounts
  useEffect(() => {
    if (!isSupported || !isAuthenticated) return;

    checkSubscription();
  }, [isSupported, isAuthenticated]);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  }, []);

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
      const vapidPublicKey = await getVapidPublicKey();

      if (!vapidPublicKey) {
        setError('Push notifications not configured on server');
        setIsLoading(false);
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend
      await subscribeToPush(subscription);

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error subscribing to push:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setIsLoading(false);
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
        await unsubscribeFromPush(subscription.endpoint);
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
