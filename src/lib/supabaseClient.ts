import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Supabase client (singleton)
// ------------------------------------------------------------
// Initialized from the public env vars. The publishable key is
// safe to ship in the bundle; the database is protected by Row
// Level Security policies. If the env isn't configured, this is
// null and services fall back to local fixtures.
// ============================================================

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = Boolean(supabase);
