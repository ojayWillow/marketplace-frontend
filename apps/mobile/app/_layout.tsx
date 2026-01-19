import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@marketplace/shared';
import { View, ActivityIndicator } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Custom storage adapter for React Native using expo-secure-store
const secureStoreAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Hydrate auth state from secure storage on app start
    const hydrateAuth = async () => {
      try {
        const stored = await SecureStore.getItemAsync('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state?.token && parsed.state?.user) {
            useAuthStore.getState().setAuth(parsed.state.user, parsed.state.token);
          }
        }
      } catch (error) {
        console.error('Failed to hydrate auth:', error);
      } finally {
        setIsReady(true);
      }
    };

    hydrateAuth();
  }, []);

  // Subscribe to auth changes and persist to secure storage
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(async (state) => {
      try {
        const toStore = {
          state: {
            user: state.user,
            token: state.token,
            isAuthenticated: state.isAuthenticated,
            isPhoneVerified: state.isPhoneVerified,
          },
        };
        await SecureStore.setItemAsync('auth-storage', JSON.stringify(toStore));
      } catch (error) {
        console.error('Failed to persist auth:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </QueryClientProvider>
  );
}
