
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Transpile down as far as esbuild allows
    target: "es2015", 
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // ES5 is the safest target for Android 5.0
    target: "es5",
    cssTarget: "chrome49", // Target for old WebViews
    minify: 'terser', // Terser handles ES5 compression better than esbuild
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
