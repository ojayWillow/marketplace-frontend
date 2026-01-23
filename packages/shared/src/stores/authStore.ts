import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { User } from '../api/types';
import { storage as defaultStorage } from './storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // Phone verification status
  isPhoneVerified: boolean;
  // Hydration tracking
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  // Helpers
  needsPhoneVerification: () => boolean;
  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

const authStateCreator: StateCreator<AuthState> = (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isPhoneVerified: false,
  _hasHydrated: false,

  setHasHydrated: (value) => set({ _hasHydrated: value }),

  // Check if user needs to verify phone
  needsPhoneVerification: () => {
    const { isAuthenticated, user } = get();
    if (!isAuthenticated || !user) return false;
    return !user.phone_verified;
  },

  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isPhoneVerified: user.phone_verified ?? false,
    }),

  // Update user data (e.g., after phone verification)
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
      isPhoneVerified: userData.phone_verified ?? state.isPhoneVerified,
    })),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isPhoneVerified: false,
    }),
});

// Factory function to create auth store with custom storage
export const createAuthStore = (storageAdapter: StateStorage) => {
  return create<AuthState>()(
    persist(authStateCreator, {
      name: 'auth-storage',
      storage: createJSONStorage(() => storageAdapter),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isPhoneVerified: state.isPhoneVerified,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    })
  );
};

// Default store using the default storage (web: localStorage, mobile: fallback)
export const useAuthStore = create<AuthState>()(
  persist(authStateCreator, {
    name: 'auth-storage',
    storage: createJSONStorage(() => defaultStorage),
    partialize: (state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      isPhoneVerified: state.isPhoneVerified,
    }),
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true);
    },
  })
);
