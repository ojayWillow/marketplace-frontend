import { StateStorage } from 'zustand/middleware';

// Platform detection - check for React Native environment
// In React Native, window exists but document doesn't have the same properties
const isWeb = typeof window !== 'undefined' && 
              typeof document !== 'undefined' && 
              typeof localStorage !== 'undefined';

// Create the appropriate storage based on platform
const createStorage = (): StateStorage => {
  if (isWeb) {
    // Web: Use localStorage
    return {
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

  // React Native: Will be overridden by mobile app's storage implementation
  // This is a fallback that does nothing - the mobile app should provide
  // its own storage via the storageAdapter pattern
  return {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
};

export const storage = createStorage();

// Allow mobile apps to override storage with their own implementation
let customStorage: StateStorage | null = null;

export const setStorageAdapter = (adapter: StateStorage) => {
  customStorage = adapter;
};

export const getStorage = (): StateStorage => {
  return customStorage || storage;
};
