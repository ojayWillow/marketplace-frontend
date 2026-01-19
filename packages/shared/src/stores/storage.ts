import { StateStorage } from 'zustand/middleware';

// Platform detection
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Storage implementation
let storage: StateStorage;

if (isReactNative) {
  // React Native: Use expo-secure-store
  let SecureStore: any;
  
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.warn('expo-secure-store not available, falling back to AsyncStorage');
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
  }

  if (SecureStore) {
    storage = {
      getItem: async (name: string) => {
        const value = await SecureStore.getItemAsync(name);
        return value ?? null;
      },
      setItem: async (name: string, value: string) => {
        await SecureStore.setItemAsync(name, value);
      },
      removeItem: async (name: string) => {
        await SecureStore.deleteItemAsync(name);
      },
    };
  }
} else {
  // Web: Use localStorage
  storage = {
    getItem: (name: string) => {
      const value = localStorage.getItem(name);
      return value ?? null;
    },
    setItem: (name: string, value: string) => {
      localStorage.setItem(name, value);
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
    },
  };
}

export { storage };
