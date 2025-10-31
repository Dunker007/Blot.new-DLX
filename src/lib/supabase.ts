import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in demo mode (placeholder credentials)
const isDemoMode = !supabaseUrl ||
                   !supabaseAnonKey ||
                   supabaseUrl.includes('placeholder') ||
                   supabaseAnonKey.includes('placeholder');

// Use placeholder values for demo mode
const url = isDemoMode ? 'https://demo.supabase.co' : supabaseUrl;
const key = isDemoMode ? 'demo-key' : supabaseAnonKey;

if (isDemoMode) {
  console.warn('⚠️ Running in DEMO MODE - Supabase features disabled');
  console.warn('To enable full functionality:');
  console.warn('1. Create a Supabase project at https://supabase.com');
  console.warn('2. Update .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, key);
export { isDemoMode };
