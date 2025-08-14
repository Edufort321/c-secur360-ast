import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Add default test options if needed
  },
  css: {
    postcss: './postcss.config.mjs',
  },
});
