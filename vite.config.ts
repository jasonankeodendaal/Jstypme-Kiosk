
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: "es2020"
  },
  build: {
    target: "es2020",
    // Increase the chunk size warning limit to 1600kb (default is 500kb)
    // This accommodates larger libraries like PDF.js and Supabase without warning.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Strategy to split vendor code from app code for better caching performance
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Supabase client
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // PDF processing
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs';
            }
            // Icon set
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            // ZIP handling
            if (id.includes('jszip')) {
              return 'jszip';
            }
            // All other third-party dependencies
            return 'vendor';
          }
        }
      }
    }
  }
});
