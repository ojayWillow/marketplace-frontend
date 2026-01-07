import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../api/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  // 2FA state
  pending2FA: boolean
  partialToken: string | null
  pendingEmail: string | null
  setAuth: (user: User, token: string) => void
  setPending2FA: (partialToken: string, email: string) => void
  clearPending2FA: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pending2FA: false,
      partialToken: null,
      pendingEmail: null,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          pending2FA: false,
          partialToken: null,
          pendingEmail: null,
        }),
      setPending2FA: (partialToken, email) =>
        set({
          pending2FA: true,
          partialToken,
          pendingEmail: email,
          isAuthenticated: false,
        }),
      clearPending2FA: () =>
        set({
          pending2FA: false,
          partialToken: null,
          pendingEmail: null,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pending2FA: false,
          partialToken: null,
          pendingEmail: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Don't persist 2FA pending state
      }),
    }
  )
)
