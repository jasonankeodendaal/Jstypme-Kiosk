
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome 37', 'android 5'],
      // Inject critical polyfills into the legacy bundle
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      externalSystemJS: false
    }),
  ],
  esbuild: {
    // Esbuild itself can only go down to ES6, but we set it low 
    // to help the preliminary transpilation step.
    target: "es6",
    include: /\.(ts|tsx|js|jsx)$/,
    legalComments: 'none',
  },
  build: {
    // Strictly target ES5 for the final transformation
    target: "es5",
    cssTarget: "chrome37",
    modulePreload: false,
    sourcemap: false,
    // We use IIFE because Chrome 37 does not support ES Modules
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: undefined, // Disable chunking for simpler legacy loading
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'window' // Compatibility for libraries expecting 'global'
  }
});
