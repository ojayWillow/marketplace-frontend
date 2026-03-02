import { create } from 'zustand';
import type { User } from '../api/types';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  isInitialized: boolean;

  // Helpers
  needsPhoneVerification: () => boolean;
  getToken: () => string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<() => void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isPhoneVerified: false,
  isInitialized: false,

  getToken: () => {
    return get().session?.access_token ?? null;
  },

  needsPhoneVerification: () => {
    const { isAuthenticated, user } = get();
    if (!isAuthenticated || !user) return false;
    return !user.phone_verified;
  },

  setSession: (session) => {
    set({
      session,
      isAuthenticated: session !== null,
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
      isAuthenticated: false,
      isPhoneVerified: false,
    });
  },

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
          set({ session, isAuthenticated: true });
          if (session) {
            await syncLocalUser(session.access_token, set);
          }
        }

        if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
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
