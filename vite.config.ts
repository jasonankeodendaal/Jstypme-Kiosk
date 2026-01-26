
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 37', 'android >= 5', 'firefox >= 60'],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime',
        'core-js/stable/promise',
        'core-js/stable/array/iterator',
        'core-js/stable/map',
        'core-js/stable/set',
        'core-js/stable/object/assign',
        'core-js/stable/symbol',
        'core-js/stable/string/starts-with'
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
    chunkSizeWarningLimit: 2000,
    terserOptions: {
      ecma: 5,
      safari10: true,
      compress: {
        keep_fnames: true,
        keep_classnames: true,
        drop_console: true,
        passes: 2
      },
      mangle: {
        keep_fnames: true,
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['lucide-react', '@supabase/supabase-js'],
          'heavy-pdf': ['pdfjs-dist', 'jspdf'],
          'heavy-data': ['xlsx', 'jszip']
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
