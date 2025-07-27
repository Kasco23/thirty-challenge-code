import { createClient } from "@supabase/supabase-js";

// Grab the environment variables once so we can reuse them
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

// Report missing variables clearly and warn when falling back in dev
if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error(
    "Supabase env vars VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing.",
  );
  if (import.meta.env.DEV) {
    console.warn(
      "Using placeholder Supabase credentials for local development.",
    );
  }
}

const supabaseUrl = VITE_SUPABASE_URL ?? "https://example.supabase.co";
const supabaseKey = VITE_SUPABASE_ANON_KEY ?? "example-key-placeholder";

// Create Supabase client with real or fallback credentials
export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if real credentials are present
export const isSupabaseConfigured = () => {
  return (
    VITE_SUPABASE_URL &&
    VITE_SUPABASE_ANON_KEY &&
    VITE_SUPABASE_URL !== "https://example.supabase.co" &&
    VITE_SUPABASE_ANON_KEY !== "example-key-placeholder"
  );
};
