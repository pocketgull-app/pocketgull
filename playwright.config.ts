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
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 14'],
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'tablet-ipad-exam-room',
      use: {
        ...devices['iPad (gen 7)'],
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'chromebook-school-library',
      use: {
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: 'clinical-cow-workstation',
      use: {
        viewport: { width: 1280, height: 1024 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        isMobile: false,
        hasTouch: false,
      },
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
