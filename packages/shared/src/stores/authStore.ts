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
  _hasHydrated: boolean;

  // Computed
  readonly token: string | null;

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
  isAuthenticated: false,
  isPhoneVerified: false,
  isInitialized: false,
  _hasHydrated: true, // No longer using zustand/persist, always hydrated

  get token() {
    return get().session?.access_token ?? null;
  },

  getToken: () => {
    return get().session?.access_token ?? null;
  },

  setHasHydrated: () => {},

  needsPhoneVerification: () => {
    const { isAuthenticated, user } = get();
    if (!isAuthenticated || !user) return false;
    return !user.phone_verified;
  },

  /**
   * Set auth from a Supabase session + local user.
   * Also used by the phone login flow which gets a legacy JWT
   * from the backend — in that case we store the user but
   * session stays null until a Supabase session is established.
   */
  setAuth: (user, _token) => {
    set({
      user,
      isAuthenticated: true,
      isPhoneVerified: user.phone_verified ?? false,
    });
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
    // Clean up any legacy storage
    try {
      localStorage.removeItem('auth-storage');
    } catch (_) {}
  },

  /**
   * Initialize auth: restore Supabase session and listen for changes.
   * Call this once at app startup (e.g., in App.tsx or main.tsx).
   * Returns an unsubscribe function.
   */
  initAuth: async () => {
    const { setSession, setUser } = get();

    // 1. Restore existing session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        // Sync local user from backend
        await syncLocalUser(session.access_token, set);
      }
    } catch (e) {
      console.error('[Auth] Failed to restore session:', e);
    }

    set({ isInitialized: true });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.debug('[Auth] State change:', event);
        setSession(session);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
 * Call backend /auth/sync-user to ensure local user exists
 * and get the full user profile.
 */
async function syncLocalUser(
  accessToken: string,
  set: (state: Partial<AuthState>) => void
) {
  try {
    // Dynamic import to avoid circular dependency with apiClient
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

// Legacy export for createAuthStore (no longer needed but keeps imports working)
export const createAuthStore = () => useAuthStore;
