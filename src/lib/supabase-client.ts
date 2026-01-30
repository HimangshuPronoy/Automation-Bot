import { createBrowserClient } from '@supabase/ssr';
import { APP_CONFIG } from './config';

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  APP_CONFIG.supabaseUrl || 'https://placeholder.supabase.co',
  APP_CONFIG.supabaseAnonKey || 'placeholder-key'
);
