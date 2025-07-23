import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
if(supabaseUrl) {
  console.log('Supabase URL is set');
} else {
  console.error('Supabase URL is not set');
}

const supabaseKey = process.env.SUPABASE_ANON_KEY;
if(supabaseKey) {
  console.log('Supabase Key is set');
} else {
  console.error('Supabase Key is not set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);