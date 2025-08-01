import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import bundlesize from 'vite-plugin-bundlesize';

export default defineConfig({
  plugins: [
    react(),
    bundlesize({
      limits: [
        // check every generated JS entry ≤ 200 kB gzip-compressed
        { name: '**/*.js', limit: '200 kB' },
      ],
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion'],
          // Split SDKs into separate chunks for lazy loading
          supabase: ['@supabase/supabase-js'],
          daily: ['@daily-co/daily-js'],
          jotai: ['jotai'],
        },
      },
    },
    // optional: also raise Vite’s own warning bar from 500 kB to 200 kB
    chunkSizeWarningLimit: 200, // kB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'flag-icons',
    ],
  },
  define: {
    // Ensure environment variables are available at build time
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Add server configuration for development
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true,
  },
  // Preview configuration
  preview: {
    port: 3000,
    host: true,
  },
});
