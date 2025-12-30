import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Match the target to reduce double-transpilation effort
    target: "es5", 
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // ES5 is mandatory for Android 5.0 (Chrome 37)
    target: "es5",
    cssTarget: "chrome37", 
    minify: 'terser',
    modulePreload: false, 
    sourcemap: false, // Disabling sourcemaps significantly speeds up build time
    terserOptions: {
      compress: {
        keep_fnames: true,
        keep_classnames: true,
        // Reduce complexity of compression to speed up build
        passes: 1, 
      },
      mangle: {
        keep_fnames: true,
      },
      ecma: 5,
      safari10: true,
    },
    rollupOptions: {
      output: {
        format: 'iife', 
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // CRITICAL: Split large dependencies to avoid build memory exhaustion
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('xlsx')) return 'vendor-excel';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf')) return 'vendor-jspdf';
            return 'vendor-core'; // All other small dependencies
          }
        }
      }
    }
  }
});