#!/bin/bash
    set -e

    # Create project directory
    mkdir -p /home/project/dlx-command-center
    cd /home/project/dlx-command-center

    # Initialize npm project
    npm init -y

    # Install dependencies
    npm install \
      @supabase/supabase-js \
      vite \
      react \
      react-dom \
      react-spring \
      tailwindcss \
      postcss \
      eslint \
      @typescript-eslint/eslint-plugin \
      @typescript-eslint/parser \
      node-env-color \
      cross-env \
      dotenv \
      sequelize \
      mysql2 \
      express \
      body-parser \
      cors \
      socket.io \
      socket.io-client

    # Create project structure
    mkdir -p src/components src/pages src/services
    touch src/main.tsx src/App.tsx tsconfig.json .env

    # Configure Supabase (update with your actual instance details)
    cat <<EOF >.env
    VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_URL=https://your-supabase-url.supabase.co
    SUPABASE_KEY=your-supabase-key
    EOF

    # Create main application file
    cat <<EOF >src/main.tsx
    import { StrictMode } from 'react';
    import { createRoot } from 'react-dom/client';
    import App from './App.tsx';
    import './global.css';

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    EOF

    # Create application component
    cat <<EOF >src/App.tsx
    import React, { useState } from 'react';
    import Layout from './components/Layout';
    import Dashboard from './components/Dashboard';
    import DevLab from './components/DevLab';
    import Workspace from './components/Workspace';
    import Projects from './components/Projects';
    import TradingBots from './components/TradingBots';
    import Settings from './components/Settings';

    function App() {
      const [currentView, setCurrentView] = useState('dashboard');

      const renderView = () => {
        switch (currentView) {
          case 'dashboard':
            return <Dashboard onNavigate={setCurrentView} />;
          case 'dev-lab':
            return <DevLab />;
          case 'workspace':
            return <Workspace />;
          case 'projects':
            return <Projects />;
          case 'trading':
            return <TradingBots />;
          case 'settings':
            return <Settings />;
          default:
            return <Dashboard onNavigate={setCurrentView} />;
        }
      };

      return (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {renderView()}
        </Layout>
      );
    }

    export default App;
    EOF

    # Configure TypeScript
    cat <<EOF >tsconfig.json
    {
      "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "lib": ["DOM", "DOMEvents", "ESNext"],
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "preserveValueSeparation": true
      },
      "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx"]
    }
    EOF

    # Add Vite configuration
    cat <<EOF >vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      build: {
        target: 'esnext',
        lib: {
          entry: './src/main.tsx',
          name: 'dlx-command-center',
          formats: ['esmodule', 'umd'],
          fileName: 'index'
        }
      },
      server: {
        port: 5173,
        strictPort: true
      }
    });
    EOF

    # Add Supabase configuration
    cat <<EOF >supabase.ts
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
    EOF

    # Add environment configuration
    cat <<EOF >env.example
    # Example environment variables for production
    VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    API_GW_ENDPOINT=https://api-gateway.yourdomain.com
    STRIPE_PUBLIC_KEY=pk_test_123456789
    AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
    AWS_SECRET_ACCESS_KEY=1234567890abcdef1234567890abcdef
    EOF

    # Add project setup script
    cat <<EOF >setup-complete.sh
    echo "DLX Command Center project setup complete!"
    echo "You can now start the application with:"
    echo "npm run dev"
    echo "And build it with:"
    echo "npm run build"
    echo ""
    echo "Visit http://localhost:5173 to start using your new AI web creation studio!"
    EOF

    # Run completion script
    node -e 'require("child_process").execFile("bash", ["-c", "echo \"DLX Command Center project setup complete!\nYou can now start the application with:\nnpm run dev\nAnd build it with:\nnpm run build\n\nVisit http://localhost:5173 to start using your new AI web creation studio!\""], { stdio: [null, null, null] });'
