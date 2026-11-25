import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      include: ['src/**/*.spec.ts'],
      // Nest and class-validator decorators need this polyfill before any other import.
      setupFiles: ['reflect-metadata'],
   },
});
