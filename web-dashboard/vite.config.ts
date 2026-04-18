import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: parseInt(process.env.PORT || '5180'),
    strictPort: true,
  },
  preview: {
    port: parseInt(process.env.PORT || '5180'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
