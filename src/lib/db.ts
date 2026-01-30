import { createClient } from '@supabase/supabase-js';

// Use Service Role key for server-side operations to bypass RLS (if needed) or standar anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const db = createClient(supabaseUrl, supabaseKey);

