
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Chrome 37 is the actual engine for Android 5.0
      // 'android' refers to the old legacy Android Browser (v4 and below)
      targets: ['chrome >= 37'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      externalSystemJS: false
    }),
  ],
  esbuild: {
    // Hint to esbuild to keep syntax as simple as possible
    target: 'es6',
    include: /\.(ts|tsx|js|jsx)$/,
  },
  build: {
    // Force the final transformation to ES5
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
        keep_classnames: true,
      }
    },
    rollupOptions: {
      output: {
        // IIFE is the most compatible format for 2014-era browsers
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
