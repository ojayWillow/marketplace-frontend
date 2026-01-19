import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../api/types';
import { storage } from './storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // Phone verification status
  isPhoneVerified: boolean;
  // Helpers
  needsPhoneVerification: () => boolean;
  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isPhoneVerified: false,

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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isPhoneVerified: state.isPhoneVerified,
      }),
    }
  )
);
