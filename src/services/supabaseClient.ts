import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public Supabase config. The anon key is safe to expose in the frontend — it is
// designed for it and is governed by Row Level Security. Secrets (service role,
// email API keys) must never live here.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

// When both are present we run against the real backend; otherwise the app
// falls back to the localStorage demo so the preview keeps working.
export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
