import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Where the dev server forwards /api requests.
 * Overridable so you can point the frontend at a staging API:
 *   API_PROXY_TARGET=https://api.example.com npm run dev
 */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:4000';

/**
 * Keeps browsers talking to a single origin during local development and when
 * previewing a production build. In real deployments the frontend is served
 * from one host and calls the API through VITE_API_URL instead, so this proxy
 * is a convenience for local work rather than a production dependency.
 */
const apiProxy = {
  '/api': {
    target: API_PROXY_TARGET,
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],

  server: {
    // 0.0.0.0 so the dev server is reachable from outside the container/host.
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Accept whatever host header the preview proxy or tunnel sends.
    allowedHosts: true,
    proxy: apiProxy,
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
    proxy: apiProxy,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Keeps the production bundle honest about what it pulls in.
    chunkSizeWarningLimit: 600,
  },
});
