import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development, `vercel dev` serves the /api functions. If you only
// run `vite`, set VITE_DEV_API_PROXY to a running proxy (e.g. http://localhost:3000)
// to forward /api requests. By default no proxy is configured.
const apiProxy = process.env.VITE_DEV_API_PROXY;

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Pisahkan vendor agar caching lebih baik & bundle awal lebih ringan.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          motion: ['framer-motion'],
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
  server: apiProxy
    ? {
        proxy: {
          '/api': {
            target: apiProxy,
            changeOrigin: true,
          },
        },
      }
    : undefined,
});
