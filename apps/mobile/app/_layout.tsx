import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/authStore';
import { View, useColorScheme, InteractionManager, Appearance } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
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
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const notificationListener = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Theme - use system color scheme immediately, don't wait for hydration
  const systemColorScheme = useColorScheme();
  const { mode, _hasHydrated: themeHydrated } = useThemeStore();
  const [, forceUpdate] = useState({});
  
  // Determine active theme - use system as default until hydrated
  const activeTheme = themeHydrated && mode !== 'system'
    ? mode
    : (systemColorScheme === 'dark' ? 'dark' : 'light');
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const themeColors = colors[activeTheme];

  // Listen for system appearance changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    
    const subscription = Appearance.addChangeListener(() => {
      // Force re-render when system theme changes
      forceUpdate({});
    });

    return () => subscription.remove();
  }, [mode]);

  // Force re-render when theme mode changes manually
  useEffect(() => {
    forceUpdate({});
  }, [mode]);

  // Mark as ready after first render completes
  useEffect(() => {
    // Use InteractionManager to wait for animations/transitions to complete
    const handle = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
    return () => handle.cancel();
  }, []);

  // Register for push notifications AFTER app is interactive
  // This prevents blocking the initial render
  useEffect(() => {
    if (!isReady || !isAuthenticated || !token) return;
    
    // Defer push notification registration to not block UI
    const handle = InteractionManager.runAfterInteractions(() => {
      registerPushToken(token).then((success) => {
        if (success) {
          console.log('✅ Push notifications registered');
        } else {
          console.log('⚠️ Push notification registration failed');
        }
      });
    });
    
    return () => handle.cancel();
  }, [isReady, isAuthenticated, token]);

  // Setup notification listeners - can run immediately as it's just event subscription
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

  // NO LONGER BLOCKING ON HYDRATION
  // The app renders immediately with system theme defaults
  // Theme preference loads from storage and updates seamlessly

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