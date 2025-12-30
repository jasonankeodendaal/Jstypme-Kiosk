
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // esbuild does not support transforming to ES5. 
    // We target es2015 to allow the build to pass.
    target: "es2015", 
    include: /\.(ts|tsx|js|jsx)$/,
    legalComments: 'none',
  },
  build: {
    // Targeting es2015 for the bundle logic.
    // Real ES5 support for Chrome 37 usually requires @vitejs/plugin-legacy.
    target: "es2015",
    cssTarget: "chrome37", 
    minify: 'esbuild',
    modulePreload: false, 
    sourcemap: false, 
    rollupOptions: {
      output: {
        format: 'iife', 
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  }
});
