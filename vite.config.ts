import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Lowered target to es2015 for Android 5.1.1 compatibility
    target: "es2015"
  },
  build: {
    // Lowered target to es2015 for Android 5.1.1 compatibility
    target: "es2015",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            if (id.includes('jszip')) {
              return 'jszip';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});