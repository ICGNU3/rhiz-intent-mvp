import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@rhiz/db': path.resolve(__dirname, '../../packages/db/src'),
      '@rhiz/core': path.resolve(__dirname, '../../packages/core/src'),
      '@rhiz/workers': path.resolve(__dirname, '../../packages/workers/src'),
    },
  },
});
