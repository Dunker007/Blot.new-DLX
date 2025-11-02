import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'lucide-vendor': ['lucide-react'],
          // Service chunks
          services: [
            './src/services/llm.ts',
            './src/services/providerRouter.ts',
            './src/services/tokenTracking.ts',
          ],
          // Component chunks
          components: [
            './src/components/Dashboard.tsx',
            './src/components/Settings.tsx',
            './src/components/TokenAnalytics.tsx',
          ],
        },
      },
    },
    // Enable minification and tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.spec.ts',
        '**/mockData',
        'dist/',
      ],
      thresholds: {
        lines: 34,
        functions: 20,
        branches: 25,
        statements: 34,
      },
    },
  },
});
