
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Explicitly target the extremely old Chrome 37 found on Android 5.0
      targets: ['chrome 37', 'android 5'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      externalSystemJS: false
    }),
  ],
  build: {
    // We target ES5 for the maximum possible compatibility
    target: 'es5',
    cssTarget: 'chrome37',
    minify: 'terser', // Terser is better at ES5 minification than esbuild
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
        // Android 5.0 WebView often struggles with ESM, so we 
        // rely on the legacy plugin's SystemJS/IIFE injection.
        format: 'iife',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    // Shims for libraries that expect a node-like environment
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'window'
  }
});
