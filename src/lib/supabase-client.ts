import { createBrowserClient } from '@supabase/ssr';
import { APP_CONFIG } from './config';

if (!APP_CONFIG.supabaseUrl || !APP_CONFIG.supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required');
}

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  APP_CONFIG.supabaseUrl,
  APP_CONFIG.supabaseAnonKey
);
