import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Ensure these values are set in the environment
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required. Please set it in the environment variables.');
    }

    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY is required. Please set it in the environment variables.');
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
