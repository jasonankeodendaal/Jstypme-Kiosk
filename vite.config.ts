import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Transform modern syntax to ES5 early in the pipeline to reduce complexity for the bundler
    target: "es5", 
    include: /\.(ts|tsx|js|jsx)$/,
    // Remove legal comments to shave off bundle size and processing time
    legalComments: 'none',
  },
  build: {
    // ES5 is required for Chrome 37 (Android 5.0)
    target: "es5",
    cssTarget: "chrome37", 
    // esbuild is orders of magnitude faster than terser for legacy builds on Vercel
    minify: 'esbuild',
    modulePreload: false, 
    sourcemap: false, 
    rollupOptions: {
      output: {
        // IIFE is required for non-module support in Chrome 37
        format: 'iife', 
        entryFileNames: 'assets/[name]-[hash].js',
        // manualChunks is disabled here because it's incompatible with the IIFE format.
        // The entire app will be one optimized file for maximum legacy compatibility.
      }
    }
  }
});