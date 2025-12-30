import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Transform modern syntax to ES2015 first
    target: "es2015", 
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // ES5 is required for Chrome 37 (Android 5.0)
    target: "es5",
    cssTarget: "chrome37", 
    minify: 'terser',
    modulePreload: false, 
    sourcemap: false, 
    terserOptions: {
      ecma: 5,
      safari10: true,
      // CRITICAL: Disable complex compression to prevent Vercel OOM/Timeout
      // Mangling alone provides significant size reduction without the CPU cost.
      compress: false, 
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      }
    },
    rollupOptions: {
      output: {
        // IIFE is required for non-module support in Chrome 37
        format: 'iife', 
        entryFileNames: 'assets/[name]-[hash].js',
        // manualChunks is REMOVED as it's incompatible with iife format
      }
    }
  }
});