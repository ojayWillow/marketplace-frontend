/**
 * API functions for push notifications
 */
import apiClient from './client';

// Base URL for push API
const PUSH_API_BASE = '/api/push';

/**
 * Get VAPID public key from server
 */
export const getVapidPublicKey = async (): Promise<string> => {
  const response = await apiClient.get(`${PUSH_API_BASE}/vapid-public-key`);
  return response.data.publicKey;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async (
  subscription: PushSubscription,
  deviceName?: string
): Promise<{ subscription_id: number }> => {
  const subscriptionJson = subscription.toJSON();
  
  const response = await apiClient.post(`${PUSH_API_BASE}/subscribe`, {
    endpoint: subscriptionJson.endpoint,
    keys: subscriptionJson.keys,
    device_name: deviceName || getDeviceName(),
  });
  
  return response.data;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (endpoint: string): Promise<void> => {
  await apiClient.post(`${PUSH_API_BASE}/unsubscribe`, { endpoint });
};

/**
 * Get user's push subscriptions
 */
export const getPushSubscriptions = async (): Promise<{
  subscriptions: Array<{
    id: number;
    device_name: string;
    created_at: string;
  }>;
  count: number;
}> => {
  const response = await apiClient.get(`${PUSH_API_BASE}/subscriptions`);
  return response.data;
};

/**
 * Send a test notification to current user
 */
export const sendTestNotification = async (): Promise<{
  sent: number;
  failed: number;
}> => {
  const response = await apiClient.post(`${PUSH_API_BASE}/test`);
  return response.data;
};

/**
 * Helper to get device name
 */
function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) {
    if (/Mobile/.test(ua)) return 'Android Phone';
    return 'Android Tablet';
  }
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';
  
  return 'Unknown Device';
}

/**
 * Convert VAPID key from base64 to Uint8Array (needed for subscription)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
