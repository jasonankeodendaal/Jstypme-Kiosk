
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
    target: "es5",
    cssTarget: "chrome37", 
    minify: 'esbuild', // Changed from 'terser' to avoid build dependency error
    modulePreload: false,
    cssCodeSplit: false, // Faster build
    reportCompressedSize: false, // Faster build
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