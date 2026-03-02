import { create } from 'zustand';
import type { User } from '../api/types';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  /** Legacy JWT from backend (phone login). Used until backend returns Supabase sessions. */
  legacyToken: string | null;
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  isInitialized: boolean;
  _hasHydrated: boolean;

  // Helpers
  needsPhoneVerification: () => boolean;
  getToken: () => string | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<() => void>;

  // Hydration (kept for backward compat)
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  legacyToken: null,
  isAuthenticated: false,
  isPhoneVerified: false,
  isInitialized: false,
  _hasHydrated: true,

  /**
   * Get the best available token:
   * 1. Supabase session access_token (preferred, auto-refreshed)
   * 2. Legacy backend JWT (phone login fallback)
   */
  getToken: () => {
    const { session, legacyToken } = get();
    return session?.access_token ?? legacyToken;
  },

  setHasHydrated: () => {},

  needsPhoneVerification: () => {
    const { isAuthenticated, user } = get();
    if (!isAuthenticated || !user) return false;
    return !user.phone_verified;
  },

  /**
   * Set auth from backend response (phone login flow).
   * Stores the legacy JWT so the API interceptor can use it
   * until the backend returns Supabase sessions (#52).
   */
  setAuth: (user, token) => {
    set({
      user,
      legacyToken: token,
      isAuthenticated: true,
      isPhoneVerified: user.phone_verified ?? false,
    });
  },

  setSession: (session) => {
    set({
      session,
      isAuthenticated: session !== null || get().legacyToken !== null,
    });
  },

  setUser: (user) => {
    set({
      user,
      isPhoneVerified: user?.phone_verified ?? false,
    });
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
      isPhoneVerified: userData.phone_verified ?? state.isPhoneVerified,
    })),

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[Auth] Supabase signOut error:', e);
    }
    set({
      user: null,
      session: null,
      legacyToken: null,
      isAuthenticated: false,
      isPhoneVerified: false,
    });
    try {
      localStorage.removeItem('auth-storage');
    } catch (_) {}
  },

  /**
   * Initialize auth: restore Supabase session and listen for changes.
   * Call once at app startup (App.tsx).
   * Returns an unsubscribe function.
   */
  initAuth: async () => {
    // 1. Restore existing Supabase session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ session, isAuthenticated: true });
        await syncLocalUser(session.access_token, set);
      }
    } catch (e) {
      console.error('[Auth] Failed to restore session:', e);
    }

    set({ isInitialized: true });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.debug('[Auth] State change:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          set({ session, isAuthenticated: true, legacyToken: null });
          if (session) {
            await syncLocalUser(session.access_token, set);
          }
        }

        if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            legacyToken: null,
            isAuthenticated: false,
            isPhoneVerified: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  },
}));

/**
 * Call backend /auth/sync-user to get/create the local user profile.
 */
async function syncLocalUser(
  accessToken: string,
  set: (state: Partial<AuthState>) => void
) {
  try {
    const { default: apiClient } = await import('../api/client');
    const response = await apiClient.post(
      '/api/auth/sync-user',
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const user = response.data.user;
    if (user) {
      set({
        user,
        isPhoneVerified: user.phone_verified ?? false,
      });
    }
  } catch (e) {
    console.error('[Auth] Failed to sync local user:', e);
  }
}

export const createAuthStore = () => useAuthStore;
