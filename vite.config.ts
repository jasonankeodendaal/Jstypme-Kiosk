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
    minify: 'terser',
    modulePreload: false,
    cssCodeSplit: false, // Faster build
    reportCompressedSize: false, // Faster build
    terserOptions: {
      ecma: 5,
      safari10: true,
      compress: {
        // Disabling these heavy passes significantly speeds up the build
        passes: 1,
        pure_funcs: ['console.log', 'console.info'],
        drop_debugger: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      }
    },
    rollupOptions: {
      output: {
        // Force IIFE (Immediately Invoked Function Expression)
        // This removes the need for type="module" in index.html
        format: 'iife',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: undefined, // IIFE requires a single bundle
      }
    }
  }
});