
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Đảm bảo process.env có sẵn trong runtime của trình duyệt cho các biến môi trường
    'process.env': process.env
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  }
});
