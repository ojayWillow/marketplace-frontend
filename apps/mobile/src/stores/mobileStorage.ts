import { StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mobile storage implementation using SecureStore with AsyncStorage fallback
export const mobileStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // Try SecureStore first (more secure for auth tokens)
      const value = await SecureStore.getItemAsync(name);
      return value ?? null;
    } catch (e) {
      // Fall back to AsyncStorage if SecureStore fails
      // (can happen with certain key names or storage limits)
      try {
        const value = await AsyncStorage.getItem(name);
        return value ?? null;
      } catch (e2) {
        console.warn('Storage getItem error:', e2);
        return null;
      }
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (e) {
      // Fall back to AsyncStorage
      try {
        await AsyncStorage.setItem(name, value);
      } catch (e2) {
        console.warn('Storage setItem error:', e2);
      }
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (e) {
      // Also try AsyncStorage in case it was stored there
      try {
        await AsyncStorage.removeItem(name);
      } catch (e2) {
        console.warn('Storage removeItem error:', e2);
      }
    }
  },
};
