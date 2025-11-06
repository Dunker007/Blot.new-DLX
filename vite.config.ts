import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/spaceship': {
        target: 'https://spaceship.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spaceship/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward custom headers - Vite lowercases headers, so check both cases
            const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
            const apiSecret = req.headers['x-api-secret'] || req.headers['X-API-Secret'];
            if (apiKey) proxyReq.setHeader('X-API-Key', Array.isArray(apiKey) ? apiKey[0] : apiKey);
            if (apiSecret) proxyReq.setHeader('X-API-Secret', Array.isArray(apiSecret) ? apiSecret[0] : apiSecret);
          });
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-vendor';
            }
            if (id.includes('monaco-editor')) {
              return 'monaco-vendor';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          
          // Large services
          if (id.includes('/services/')) {
            if (id.includes('llm') || id.includes('providerRouter') || id.includes('tokenTracking')) {
              return 'core-services';
            }
            if (id.includes('multiModelOrchestrator') || id.includes('modelDiscovery')) {
              return 'ai-services';
            }
            return 'services';
          }
          
          // Large components
          if (id.includes('/components/')) {
            if (id.includes('AICommandCenter') || id.includes('Dashboard')) {
              return 'core-components';
            }
            if (id.includes('MonacoEditor') || id.includes('Workspace')) {
              return 'editor-components';
            }
            if (id.includes('AudioTranscriber') || id.includes('ImageAnalysis')) {
              return 'multimodal-components';
            }
            return 'components';
          }
          
          // Modules
          if (id.includes('/modules/')) {
            return 'modules';
          }
        },
        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Enable minification and tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
        passes: 2, // Multiple passes for better optimization
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Source maps for production debugging (optional)
    sourcemap: false,
    // Target modern browsers
    target: 'esnext',
    // CSS code splitting
    cssCodeSplit: true,
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
