import { createClient } from '@supabase/supabase-js';

// Use VITE_ prefix for client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create client with fallback values for development
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};