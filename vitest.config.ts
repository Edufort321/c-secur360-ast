import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/types': path.resolve(__dirname, 'app/types'),
    },
  },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
  },
});
