import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/authStore';
import { useColorScheme, InteractionManager, Platform, Dimensions, UIManager, LayoutAnimation } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import { registerPushToken, setupNotificationListeners } from '../utils/pushNotifications';
import { useThemeStore } from '../src/stores/themeStore';
import { lightTheme, darkTheme, colors } from '../src/theme';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}
LayoutAnimation.configureNext = () => {};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

const { width, height } = Dimensions.get('window');
const fallbackMetrics = {
  frame: { x: 0, y: 0, width, height },
  insets: {
    top: Platform.select({
      ios: 47,
      android: Constants.statusBarHeight || 24,
      default: 0,
    }),
    bottom: Platform.select({
      ios: 34,
      android: 0,
      default: 0,
    }),
    left: 0,
    right: 0,
  },
};
const safeAreaMetrics = initialWindowMetrics || fallbackMetrics;

export default function RootLayout() {
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const notificationListener = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const systemColorScheme = useColorScheme();
  const { mode, _hasHydrated: themeHydrated } = useThemeStore();
  
  const { theme, themeColors } = useMemo(() => {
    const activeTheme = themeHydrated && mode !== 'system'
      ? mode
      : (systemColorScheme === 'dark' ? 'dark' : 'light');
    return {
      theme: activeTheme === 'dark' ? darkTheme : lightTheme,
      themeColors: colors[activeTheme],
    };
  }, [systemColorScheme, mode, themeHydrated]);

  const contentStyle = useMemo(() => ({ 
    backgroundColor: themeColors.background 
  }), [themeColors.background]);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
    return () => handle.cancel();
  }, []);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !token) return;
    const handle = InteractionManager.runAfterInteractions(() => {
      registerPushToken(token);
    });
    return () => handle.cancel();
  }, [isReady, isAuthenticated, token]);

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
    return () => cleanup();
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

  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <StatusBar style={themeColors.statusBar} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle,
                // CRITICAL: Disable ALL animations
                animation: 'none',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                presentation: 'card',
              }}
            />
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
