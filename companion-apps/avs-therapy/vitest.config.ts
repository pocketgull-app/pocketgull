import '@angular/compiler';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 30000,
    testTimeout: 30000,
    setupFiles: [
      path.resolve(__dirname, '../../tests/init-globals.ts'),
      path.resolve(__dirname, '../../tests/setup.ts')
    ],
    include: [
      './src/**/*.spec.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**'
    ]
  }
});
