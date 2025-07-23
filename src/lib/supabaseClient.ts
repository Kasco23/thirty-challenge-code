import {creatcRemixClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
`
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = creatcRemixClient(supabaseUrl, supabaseKey);