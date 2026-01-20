import { StateStorage } from 'zustand/middleware';

// Platform detection - check for React Native environment
// navigator.product is unreliable in Expo, so we check for window and document
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof localStorage !== 'undefined';

// Storage implementation
let storage: StateStorage;

if (!isWeb) {
  // React Native: Use expo-secure-store
  let SecureStore: any;
  
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.warn('expo-secure-store not available, falling back to AsyncStorage');
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      storage = {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ?? null;
        },
        setItem: async (name: string, value: string) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      };
    } catch (e2) {
      // Fallback to no-op storage if nothing is available
      console.warn('No storage available, auth will not persist');
      storage = {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      };
    }
  }

  if (SecureStore && !storage) {
    storage = {
      getItem: async (name: string) => {
        try {
          const value = await SecureStore.getItemAsync(name);
          return value ?? null;
        } catch (e) {
          console.warn('SecureStore getItem error:', e);
          return null;
        }
      },
      setItem: async (name: string, value: string) => {
        try {
          await SecureStore.setItemAsync(name, value);
        } catch (e) {
          console.warn('SecureStore setItem error:', e);
        }
      },
      removeItem: async (name: string) => {
        try {
          await SecureStore.deleteItemAsync(name);
        } catch (e) {
          console.warn('SecureStore removeItem error:', e);
        }
      },
    };
  }
} else {
  // Web: Use localStorage
  storage = {
    getItem: (name: string) => {
      try {
        const value = localStorage.getItem(name);
        return value ?? null;
      } catch (e) {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        console.warn('localStorage setItem error:', e);
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (e) {
        console.warn('localStorage removeItem error:', e);
      }
    },
  };
}

export { storage };
