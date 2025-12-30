
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Lower target to es2015 to support older Chromium/WebView versions
    target: "es2015",
    // Ensure Class Properties and modern operators are transpiled
    supported: {
      'class-properties': true,
      'optional-chaining': true,
      'nullish-coalescing': true
    }
  },
  build: {
    // Target browsers that support ES6 modules, but optimize code for es2015 compatibility
    target: "es2015",
    // Increase the chunk size warning limit
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
