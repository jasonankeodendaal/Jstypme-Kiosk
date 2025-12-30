import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Setting target to chrome37 forces esbuild to transpile const/let to var 
    // and handle other basic ES6 features for the old browser engine.
    target: "chrome37", 
    include: /\.(ts|tsx|js|jsx)$/,
    legalComments: 'none',
  },
  build: {
    // Production target for compatibility
    target: "chrome37",
    minify: 'esbuild', // Changed from 'terser' to use built-in minifier and avoid dependency error
    cssTarget: "chrome37", 
    modulePreload: false, 
    sourcemap: false, 
    rollupOptions: {
      output: {
        // IIFE format is best for older browsers without module support
        format: 'iife', 
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});