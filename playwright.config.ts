import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.resolve(__dirname, 'e2e'),
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/src/**', '**/node_modules/**', '**/tmp/**', '**/.temp/**', '**/Temp/**', '**/*.tmp', '**/.venv/**', '**/pg2/**', '**/branddesk/**', '**/tests/**'],
  outputDir: path.resolve(__dirname, 'tmp/playwright-results'),
  fullyParallel: true,
  timeout: 30 * 1000,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['PLAYWRIGHT_WORKERS'] ? parseInt(process.env['PLAYWRIGHT_WORKERS'], 10) : 4,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]] : 'html',
  use: {
    baseURL: process.env['BASE_URL'] || 'http://127.0.0.1:4000',
    trace: 'off',
    bypassCSP: true,
    permissions: ['microphone'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    env: {
      PORT: '4000',
      NODE_ENV: 'production',
      PLAYWRIGHT_TESTING: 'true',
    },
  },
});
