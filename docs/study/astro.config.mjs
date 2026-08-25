// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: __dirname,
  cacheDir: path.resolve(__dirname, '.astro'),
  base: '/docs/study/',
  integrations: [mdx()],
  outDir: './dist',
  vite: {
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || 'placeholder-key-for-build')
    }
  }
});