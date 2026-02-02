import { useState, useEffect, useCallback } from 'react';
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
  urlBase64ToUint8Array,
} from '@marketplace/shared/src/api/push';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTest: () => Promise<boolean>;
}

/**
 * Hook for managing push notification subscriptions.
 * Handles permission requests, subscription to push service, and registration with backend.
 */
export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported and get current status
  useEffect(() => {
    const checkSupport = async () => {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setPermission('unsupported');
        setIsLoading(false);
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      // Check if already subscribed
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Error checking push subscription:', err);
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported on this device');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission
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

      // Subscribe to push service
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Register subscription with backend
      await subscribeToPush(subscription);

      setIsSubscribed(true);
      setIsLoading(false);
      return true;

    } catch (err: any) {
      console.error('Error subscribing to push:', err);
      setError(err.message || 'Failed to subscribe to notifications');
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe();
        
        // Notify backend
        await unsubscribeFromPush(subscription.endpoint);
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;

    } catch (err: any) {
      console.error('Error unsubscribing from push:', err);
      setError(err.message || 'Failed to unsubscribe');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Send a test notification
   */
  const sendTest = useCallback(async (): Promise<boolean> => {
    try {
      const result = await sendTestNotification();
      return result.sent > 0;
    } catch (err: any) {
      console.error('Error sending test notification:', err);
      setError(err.message || 'Failed to send test notification');
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTest,
  };
};

export default usePushNotifications;
