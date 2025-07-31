import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import bundlesize from "vite-plugin-bundlesize";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()
           bundlesize({
+       limits: [
+         { name: "assets/index-*.js", limit: "100 kB", mode: "uncompressed" },
+         { name: "**/*",              limit: "150 kB", mode: "uncompressed" },
+       ],
+     }),
     ],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js',
      '@daily-co/daily-js',
      'flag-icons',
    ],
  },
});
