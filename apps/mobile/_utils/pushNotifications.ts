import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.quick-help.lv/api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  ios?: {
    status: Notifications.IosAuthorizationStatus;
  };
}

/**
 * Request permission to send push notifications
 */
export async function requestPushPermissions(): Promise<PushNotificationPermissions> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return { granted: false, canAskAgain: false };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask for permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return { granted: false, canAskAgain: true };
  }

  // For Android, set notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9',
    });
  }

  return { granted: true, canAskAgain: false };
}

/**
 * Get the Expo push token for this device
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Expo Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Register push token with backend
 */
export async function registerPushToken(authToken: string): Promise<boolean> {
  try {
    // Request permissions first
    const permissions = await requestPushPermissions();
    if (!permissions.granted) {
      console.log('Push notifications not permitted');
      return false;
    }

    // Get push token
    const pushToken = await getExpoPushToken();
    if (!pushToken) {
      console.log('Failed to get push token');
      return false;
    }

    // Get device info
    const deviceName = `${Device.modelName || 'Unknown'} (${Platform.OS})`;

    // Send to backend
    const response = await axios.post(
      `${API_URL}/push/subscribe`,
      {
        endpoint: pushToken,
        keys: {
          p256dh: 'expo', // Expo handles encryption
          auth: 'expo',
        },
        device_name: deviceName,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log('Push token registered:', response.data);
    return true;
  } catch (error) {
    console.error('Failed to register push token:', error);
    return false;
  }
}

/**
 * Unregister push token from backend
 */
export async function unregisterPushToken(authToken: string): Promise<boolean> {
  try {
    const pushToken = await getExpoPushToken();
    if (!pushToken) {
      return false;
    }

    await axios.post(
      `${API_URL}/push/unsubscribe`,
      { endpoint: pushToken },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log('Push token unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister push token:', error);
    return false;
  }
}

/**
 * Send a test notification (for testing purposes)
 */
export async function sendTestNotification(authToken: string): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/push/test`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log('Test notification sent');
  } catch (error) {
    console.error('Failed to send test notification:', error);
  }
}

/**
 * Set up notification listeners
 * Returns cleanup function
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listener for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  // Listener for when user taps a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification tapped:', response);
      onNotificationTapped?.(response);
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: { seconds: 1 },
  });
}
