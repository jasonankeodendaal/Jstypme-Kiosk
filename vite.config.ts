import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Transpile down as much as possible in the dev engine
    target: "es2015", 
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // ES5 is mandatory for Android 5.0 (Chrome 37)
    target: "es5",
    cssTarget: "chrome37", 
    minify: 'terser',
    modulePreload: false, // Disable modern module preloading
    terserOptions: {
      compress: {
        keep_fnames: true,
        keep_classnames: true,
      },
      mangle: {
        keep_fnames: true,
      },
      // Ensure syntax is pure ES5
      ecma: 5,
      safari10: true,
    },
    rollupOptions: {
      output: {
        // Force non-module format for maximum compatibility
        format: 'iife', 
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      }
    }
  }
});