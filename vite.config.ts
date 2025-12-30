
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for assets
  esbuild: {
    target: "es2015", 
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // Esbuild cannot natively transpile modern syntax (const/let, arrow functions) to ES5.
    // Setting target to es2015 allows the build to succeed while maintaining 
    // the highest possible legacy compatibility within the esbuild engine.
    target: "es2015",
    cssTarget: "chrome37", 
    minify: 'esbuild',
    modulePreload: false,
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Force IIFE (Immediately Invoked Function Expression)
        // This makes the final production bundle compatible with non-module browsers
        format: 'iife',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: undefined, // IIFE requires a single bundle
      }
    }
  }
});