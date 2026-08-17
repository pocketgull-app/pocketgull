import '@angular/compiler';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
    root: __dirname,
    test: {
        dir: __dirname,
        globals: true,
        environment: 'jsdom',
        isolate: true,
        setupFiles: [
            path.resolve(__dirname, 'tests/init-globals.ts'),
            path.resolve(__dirname, 'tests/setup.ts')
        ],
        include: [
            'src/**/*.spec.ts',
            'tests/**/*.spec.ts',
            'packages/**/*.spec.ts'
        ],
        exclude: [
            '**/AppData/**',
            '**/Local Settings/**',
            '**/Steam/**',
            '**/Google/**',
            '**/pg2/**',
            '**/Pocketgull/pg2/**',
            'e2e/**',
            'node_modules/**',
            'pocketgull_flutter/**',
            'companion-apps/**'
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/environments/**']
        }
    }
});
