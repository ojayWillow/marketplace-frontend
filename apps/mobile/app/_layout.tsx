import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@marketplace/shared';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for Zustand to hydrate from storage
    // The persist middleware handles this automatically
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    // If already hydrated (or no persist data), set ready
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isReady) {
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
