
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
        'core-js/modules/es.promise.js',
        'core-js/modules/es.array.iterator.js'
      ],
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
