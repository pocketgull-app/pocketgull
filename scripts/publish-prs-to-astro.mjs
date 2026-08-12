import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceDir = path.join(rootDir, 'docs', 'retroactive-prs');
const targetDir = path.join(rootDir, 'docs', 'study', 'src', 'pages', 'prs');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Read all PR files
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md'));

let count = 0;

for (const file of files) {
  const version = file.replace('.md', '');
  const sourcePath = path.join(sourceDir, file);
  // Astro pages should be .md or .mdx. We use .mdx to support standard Markdown
  const targetPath = path.join(targetDir, `${version}.mdx`);
  
  const content = fs.readFileSync(sourcePath, 'utf8');
  
  const frontmatter = `---
layout: ../../layouts/DocsLayout.astro
title: "PR: v${version}"
---

`;

  fs.writeFileSync(targetPath, frontmatter + content);
  count++;
}

console.log(`Successfully published ${count} PRs to the Astro site at docs/study/src/pages/prs/`);
