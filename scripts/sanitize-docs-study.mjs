import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, '..', 'public', 'docs', 'study');

if (fs.existsSync(docsDir)) {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  console.log(`🧹 Sanitizing ${files.length} markdown docs in ${docsDir}...`);

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Strip YAML frontmatter
    content = content.replace(/^---[\r\n]+[\s\S]*?[\r\n]+---[\r\n]*/, '');

    // 2. Strip Astro / MDX import lines
    content = content.replace(/^import\s+.*?;\s*[\r\n]*/gm, '');

    // 3. Transform <DocNode ...>...</DocNode> into standard markdown / HTML links
    content = content.replace(/<DocNode\s+([^>]*?)>([\s\S]*?)<\/DocNode>/gi, (match, attrs, innerText) => {
      const hintMatch = attrs.match(/hint="([^"]*)"/i);
      const linkMatch = attrs.match(/link="([^"]*)"/i);
      const catMatch = attrs.match(/category="([^"]*)"/i);
      
      const hint = hintMatch ? hintMatch[1] : '';
      const link = linkMatch ? linkMatch[1] : '';
      const cat = catMatch ? catMatch[1] : '';

      const title = hint ? ` "${cat ? `[${cat}] ` : ''}${hint}"` : '';
      if (link) {
        return `[${innerText}](${link}${title})`;
      }
      return `**${innerText}**`;
    });

    fs.writeFileSync(filePath, content.trimStart(), 'utf-8');
    console.log(`  ✓ Cleaned ${file}`);
  }
  console.log('✅ All docs in public/docs/study/ sanitized!');
}
