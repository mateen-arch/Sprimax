import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.join(frontendRoot, 'node_modules/react'),
      'react-dom': path.join(frontendRoot, 'node_modules/react-dom'),
      'lucide-react': path.join(frontendRoot, 'node_modules/lucide-react'),
      jspdf: path.join(frontendRoot, 'node_modules/jspdf'),
      'jspdf-autotable': path.join(frontendRoot, 'node_modules/jspdf-autotable'),
      xlsx: path.join(frontendRoot, 'node_modules/xlsx'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
