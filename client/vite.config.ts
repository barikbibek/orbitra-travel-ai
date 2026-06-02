import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// VITE_API_TARGET defaults to localhost for local dev.
// In Docker Compose it is set to http://server:5000 via the environment.
// Cast to any avoids needing @types/node for process.env in this config file.
const apiTarget = (process as any).env?.VITE_API_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Needed so Docker can expose the port
    proxy: {
      // Proxy all /api calls to the backend
      '/api': {
        target:       apiTarget,
        changeOrigin: true,
        secure:       false,
      },
    },
  },
});