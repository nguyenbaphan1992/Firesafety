
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simplified Vite configuration as the API key is injected automatically and process.cwd() was causing type errors.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  }
});
