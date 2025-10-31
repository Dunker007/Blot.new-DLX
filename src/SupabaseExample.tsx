import React, { useState } from 'react';
    import { getSupabaseClient } from './supabase';

    const SupabaseExample: React.FC = () => {
      const [user, setUser] = useState<string | null>(null);
      const [error, setError] = useState<string>('');

      // Get Supabase client
      const supabase = getSupabaseClient();

      // User sign-up function
      const handleSignUp = async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          setUser(data.user_id);
        } catch (err) {
          setError('Failed to sign up. Please try again.');
          console.error(err);
        }
      };

      // User sign-in function
      const handleSignIn = async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          setUser(data.user_id);
        } catch (err) {
          setError('Failed to sign in. Please check your credentials.');
          console.error(err);
        }
      };

      // Store data in Supabase
      const handleStoreData = async () => {
        if (!user) return;
        
        try {
          const { data, error } = await supabase.from('users').update(user, { name: 'Test User' });
          if (error) throw error;
          alert('Data stored successfully!');
        } catch (err) {
          setError('Failed to store data. Check console for details.');
          console.error(err);
        }
      };

      return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
          <h1>Supabase Example</h1>
          
          {/* User Authentication Section */}
          <div style={{ marginBottom: '20px' }}>
            <h2>Sign Up/In</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="email" 
                placeholder="Email" 
                style={{ padding: '8px', borderRadius: '5px' }}
              />
              <input 
                type="password" 
                placeholder="Password" 
                style={{ padding: '8px', borderRadius: '5px' }}
              />
            </div>
            <button onClick={handleSignUp} style={{ padding: '8px 16px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', marginTop: '10px' }}>
              Sign Up
            </button>
            <button onClick={handleSignIn} style={{ padding: '8px 16px', borderRadius: '5px', backgroundColor: '#28a745', color: '#fff', marginTop: '10px' }}>
              Sign In
            </button>
            {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
          </div>
          
          {/* Store Data Button */}
          <button onClick={handleStoreData} style={{ padding: '8px 16px', borderRadius: '5px', backgroundColor: '#ffc107', color: '#000', marginTop: '20px' }}>
            Store User Data
          </button>
          
          {/* Display User Info if authenticated */}
          {user && (
            <div style={{ marginTop: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '10px' }}>
              <h2>Welcome, {user}</h2>
              <p>You are now authenticated and can use Supabase features.</p>
            </div>
          )}
        </div>
      );
    };

    export default SupabaseExample;
