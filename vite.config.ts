
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 37', 'android >= 5'],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime',
        'core-js/stable/promise',
        'core-js/stable/map',
        'core-js/stable/set'
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
    chunkSizeWarningLimit: 3000,
    terserOptions: {
      ecma: 5,
      compress: {
        drop_console: true,
        passes: 3
      },
      mangle: {
        keep_fnames: false,
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/static-[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'v-react';
            if (id.includes('pdfjs-dist') || id.includes('jspdf')) return 'v-pdf';
            if (id.includes('xlsx') || id.includes('jszip')) return 'v-data';
            if (id.includes('lucide-react')) return 'v-icons';
            return 'v-vendor';
          }
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'window'
  },
  server: {
    host: true
  }
});
