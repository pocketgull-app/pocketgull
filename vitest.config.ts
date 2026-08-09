import '@angular/compiler';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        root: __dirname,
        setupFiles: ['./tests/setup.ts'],
        include: [
            'src/**/*.spec.ts',
            'tests/**/*.spec.ts'
        ],
        exclude: [
            'e2e/**/*',
            'node_modules/**/*'
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/environments/**']
        }
    }
});
