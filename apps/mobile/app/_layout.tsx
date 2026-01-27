import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/authStore';
import { View, useColorScheme, InteractionManager, Appearance, Platform, Dimensions, UIManager, LayoutAnimation } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerPushToken, setupNotificationListeners } from '../utils/pushNotifications';
import { useThemeStore } from '../src/stores/themeStore';
import { lightTheme, darkTheme, colors } from '../src/theme';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

// CRITICAL: Disable ALL LayoutAnimations globally to prevent content jumps
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

// Override LayoutAnimation.configureNext to be a no-op
const originalConfigureNext = LayoutAnimation.configureNext;
LayoutAnimation.configureNext = () => {}; // Disable all layout animations

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// CRITICAL FIX FOR EXPO GO:
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

let renderCount = 0;

export default function RootLayout() {
  renderCount++;
  const currentRender = renderCount;
  
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const notificationListener = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const systemColorScheme = useColorScheme();
  const { mode, _hasHydrated: themeHydrated } = useThemeStore();
  const [, forceUpdate] = useState({});
  
  const activeTheme = themeHydrated && mode !== 'system'
    ? mode
    : (systemColorScheme === 'dark' ? 'dark' : 'light');
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const themeColors = colors[activeTheme];

  // DEBUG LOGGING
  console.log(`\n🏗️  ROOT LAYOUT RENDER #${currentRender}`, {
    pathname,
    segments: segments.join('/'),
    isReady,
    isAuthenticated,
    themeHydrated,
    activeTheme,
  });

  useEffect(() => {
    console.log('📍 PATHNAME CHANGED:', pathname);
  }, [pathname]);

  useEffect(() => {
    console.log('🧭 SEGMENTS CHANGED:', segments.join('/'));
  }, [segments]);

  useEffect(() => {
    if (mode !== 'system') return;
    
    const subscription = Appearance.addChangeListener(() => {
      console.log('🎨 THEME APPEARANCE CHANGED');
      forceUpdate({});
    });

    return () => subscription.remove();
  }, [mode]);

  useEffect(() => {
    console.log('🎨 THEME MODE CHANGED:', mode);
    forceUpdate({});
  }, [mode]);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      console.log('✅ ROOT LAYOUT READY');
      setIsReady(true);
    });
    return () => handle.cancel();
  }, []);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !token) return;
    
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

  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <PaperProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={themeColors.statusBar} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: themeColors.background },
              animation: 'slide_from_right',
              animationDuration: 250,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              freezeOnBlur: true,
              headerMode: 'screen',
              presentation: 'card',
            }}
          />
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
