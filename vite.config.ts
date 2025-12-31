
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 37'],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime',
        'core-js/stable/promise',
        'core-js/stable/array/iterator',
        'core-js/stable/map',
        'core-js/stable/set',
        'core-js/stable/object/assign',
        'core-js/stable/symbol'
      ],
      renderLegacyChunks: true,
      modernPolyfills: true,
      externalSystemJS: false
    }),
  ],
  build: {
    target: 'es5',
    cssTarget: 'chrome37',
    minify: 'terser',
    terserOptions: {
      compress: {
        keep_fnames: true,
        keep_classnames: true,
      },
      mangle: {
        keep_fnames: true,
      }
    },
    rollupOptions: {
      output: {
        // Force non-module format for legacy compatibility
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
  },
  server: {
    // Force esbuild to transpile everything to ES5 during dev for testing on old tablets
    host: true
  }
});
