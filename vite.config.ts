
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Chrome 37 is the target for Android 5.0 tablets
      targets: ['chrome >= 37'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      externalSystemJS: false
    }),
  ],
  esbuild: {
    target: 'es6',
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // ES5 is required for Chrome 37
    target: 'es5',
    cssTarget: 'chrome37',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Disable some aggressive optimizations for stability on old engines
        keep_fnames: true,
        keep_classnames: true,
      },
      mangle: {
        keep_fnames: true,
      }
    },
    rollupOptions: {
      output: {
        // IIFE is the most reliable format for non-ESM browsers
        format: 'iife',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'window'
  }
});
