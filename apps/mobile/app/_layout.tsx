import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@marketplace/shared';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerPushToken, setupNotificationListeners } from '../utils/pushNotifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Custom theme matching your brand colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0ea5e9', // sky-500
    secondary: '#f59e0b', // amber-500
    tertiary: '#10b981', // emerald-500
    error: '#ef4444', // red-500
    background: '#ffffff',
    surface: '#f8fafc', // slate-50
    surfaceVariant: '#f1f5f9', // slate-100
    onSurface: '#0f172a', // slate-900
    onSurfaceVariant: '#475569', // slate-600
  },
};

export default function RootLayout() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const notificationListener = useRef<(() => void) | null>(null);

  // Register for push notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      // Register push token with backend
      registerPushToken(token).then((success) => {
        if (success) {
          console.log('✅ Push notifications registered');
        } else {
          console.log('⚠️ Push notification registration failed');
        }
      });
    }
  }, [isAuthenticated, token]);

  // Setup notification listeners
  useEffect(() => {
    // Setup listeners
    const cleanup = setupNotificationListeners(
      // When notification received in foreground
      (notification) => {
        console.log('📬 Notification received:', notification.request.content);
      },
      // When user taps notification
      (response) => {
        console.log('👆 Notification tapped:', response.notification.request.content);
        handleNotificationTap(response);
      }
    );

    notificationListener.current = cleanup;

    return () => {
      cleanup();
    };
  }, []);

  // Handle notification tap - navigate to relevant screen
  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (!data) return;

    // Navigate based on notification type
    if (data.taskId) {
      router.push(`/task/${data.taskId}`);
    } else if (data.offeringId) {
      router.push(`/offering/${data.offeringId}`);
    } else if (data.conversationId) {
      router.push(`/conversation/${data.conversationId}`);
    } else if (data.type === 'message') {
      router.push('/(tabs)/messages');
    } else if (data.type === 'application') {
      router.push('/(tabs)/');
    }
  };

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </QueryClientProvider>
    </PaperProvider>
  );
}
