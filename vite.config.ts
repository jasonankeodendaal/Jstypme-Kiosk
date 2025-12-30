
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Lowering target to ES2015 for better compatibility with older WebViews
    target: "es2015"
  },
  build: {
    // Setting target to Chrome 49 (minimum floor for many legacy Android devices)
    target: ["es2015", "chrome49"],
    cssTarget: "chrome49",
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
