// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

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
            '@google-cloud/storage': path.resolve(__dirname, 'src/mocks/empty.ts'),
            '@pocketgull/core-sdk': path.resolve(__dirname, 'packages/core-sdk/src/index.ts'),
            '@pocketgull/ismp-clinical-guard': path.resolve(__dirname, 'packages/ismp-clinical-guard/src/index.ts'),
            '@pocketgull/clinical-parquet-duckdb': path.resolve(__dirname, 'packages/clinical-parquet-duckdb/src/index.ts'),
            '@pocketgull/open-sanctuary': path.resolve(__dirname, 'packages/open-sanctuary/src/index.ts'),
            '@pocketgull/open-scribe': path.resolve(__dirname, 'packages/open-scribe/src/index.ts'),
            '@pocketgull/sidecar-proxy': path.resolve(__dirname, 'packages/sidecar-proxy/src/index.ts')
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                url: 'http://localhost:4000/'
            }
        },
        hookTimeout: 30000,
        testTimeout: 30000,
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
