import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import { compression } from 'vite-plugin-compression2';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
  ],
  define: {
    // Define process.env for compatibility with some libraries
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@mui/material', '@mui/icons-material'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['date-fns', 'decimal.js', 'clsx', 'tailwind-merge'],
          state: ['zustand'],
          forms: ['react-hook-form'],
          notifications: ['react-hot-toast', 'react-toastify'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'zustand',
      'axios',
    ],
  },
  server: {
    port: 5173,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});
