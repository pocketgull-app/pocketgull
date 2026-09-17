import '@angular/compiler';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: __dirname,
    resolve: {
        alias: {
            'react/jsx-dev-runtime': path.resolve(__dirname, 'packages/uswds-react-cds/tests/react-shim.ts'),
            'react/jsx-runtime': path.resolve(__dirname, 'packages/uswds-react-cds/tests/react-shim.ts'),
            'react-dom/server': path.resolve(__dirname, 'packages/uswds-react-cds/tests/react-shim.ts'),
            'react': path.resolve(__dirname, 'packages/uswds-react-cds/tests/react-shim.ts'),
        }
    },
    test: {
        globals: true,
        environment: 'node',
        setupFiles: [
            path.resolve(__dirname, 'tests/init-globals.ts'),
            path.resolve(__dirname, 'tests/setup.ts')
        ],
        include: [
            './src/**/*.spec.ts',
            './tests/**/*.spec.ts',
            './packages/**/*.spec.ts'
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/pg2/**',
            '**/Pocketgull/pg2/**',
            '**/AppData/**',
            '**/Local Settings/**',
            '**/Application Data/**',
            '**/.gemini/**',
            '**/.git/**',
            '**/.antigravity-ide/**',
            '**/.vscode/**',
            '**/InsightSpark/**',
            'e2e/**',
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
