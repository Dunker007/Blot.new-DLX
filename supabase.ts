import { createClient, type SupabaseClient } from '@supabase/supabase-js';
    
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    let supabase: SupabaseClient | null = null;
    
    function getSupabaseClient(): SupabaseClient {
      if (supabase) return supabase;
      
      // Create the client
      supabase = createClient<SUPABASE_URL, SUPABASE_ANON_KEY>(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Add a listener for changes to the Supabase instance
      supabase.auth.onAuthStateChange((_, session) => {
        console.log('Supabase auth state changed:', session);
      });
      
      return supabase;
    }
    
    export { getSupabaseClient };
