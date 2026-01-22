import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@marketplace/shared';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerPushToken, setupNotificationListeners } from '../utils/pushNotifications';
import { useThemeStore } from '../src/stores/themeStore';
import { lightTheme, darkTheme, colors } from '../src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const notificationListener = useRef<(() => void) | null>(null);
  
  // Theme
  const systemColorScheme = useColorScheme();
  const { mode, _hasHydrated: themeHydrated } = useThemeStore();
  
  // Determine active theme
  const activeTheme = mode === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : mode;
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const themeColors = colors[activeTheme];

  // Register for push notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
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
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('📬 Notification received:', notification.request.content);
      },
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

  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (!data) return;

    if (data.taskId) {
      router.push(`/task/${data.taskId}`);
    } else if (data.offeringId) {
      router.push(`/offering/${data.offeringId}`);
    } else if (data.conversationId) {
      router.push(`/conversation/${data.conversationId}`);
    } else if (data.type === 'message') {
      router.push('/(tabs)/messages');
    } else if (data.type === 'application') {
      router.push('/(tabs)');
    }
  };

  // Wait for both auth and theme stores to hydrate
  if (!hasHydrated || !themeHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={themeColors.statusBar} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: themeColors.background },
          }}
        />
      </QueryClientProvider>
    </PaperProvider>
  );
}
