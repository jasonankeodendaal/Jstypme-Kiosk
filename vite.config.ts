import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // esbuild does not support outputting ES5. We set it to ES2015
    // so it can handle modern syntax (const, arrow functions) during the initial pass.
    target: "es2015", 
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // This is the final output target. Vite will use Rollup and Terser
    // to down-level the code to ES5 for Android 5.0 (Chrome 37).
    target: "es5",
    cssTarget: "chrome37", 
    minify: 'terser',
    modulePreload: false, 
    sourcemap: false, 
    terserOptions: {
      compress: {
        keep_fnames: true,
        keep_classnames: true,
        passes: 2, 
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
        // Manual chunking to keep memory usage low on Vercel build servers
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('xlsx')) return 'vendor-excel';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf')) return 'vendor-jspdf';
            return 'vendor-core';
          }
        }
      }
    }
  }
});