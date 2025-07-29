import { createClient } from '@supabase/supabase-js';

// Read environment variables injected by Vite.  When running locally
// these should be provided in a `.env` file; in production Netlify
// or another hosting platform can supply them via build settings.
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env as {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error(
    'Supabase env vars VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing.',
  );
}

// Fallback values to avoid runtime crashes if environment variables are not set
const supabaseUrl = VITE_SUPABASE_URL ?? 'https://example.supabase.co';
const supabaseKey = VITE_SUPABASE_ANON_KEY ?? 'example-key-placeholder';

/**
 * Singleton Supabase client.  The client uses either the provided
 * environment variables or placeholder strings.  In development the
 * placeholders will still allow method calls but will fail against
 * the real API, which is useful to catch misconfiguration early.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Returns `true` if real Supabase credentials appear to be present.
 */
export const isSupabaseConfigured = () => {
  return (
    VITE_SUPABASE_URL !== undefined &&
    VITE_SUPABASE_ANON_KEY !== undefined &&
    VITE_SUPABASE_URL !== 'https://example.supabase.co' &&
    VITE_SUPABASE_ANON_KEY !== 'example-key-placeholder'
  );
};
