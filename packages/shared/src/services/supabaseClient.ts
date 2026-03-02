/**
 * Supabase client singleton for frontend authentication.
 *
 * Uses the ANON key (public, safe for browser). All auth operations
 * (signUp, signIn, getSession, onAuthStateChange) go through this client.
 *
 * Env vars required:
 *   VITE_SUPABASE_URL      - Supabase project URL
 *   VITE_SUPABASE_ANON_KEY - Supabase anonymous/public key
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Auth features will not work until these are configured.'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Needed for magic links / password reset
    },
  }
);
