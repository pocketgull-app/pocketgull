import fs from 'node:fs';
import path from 'node:path';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const base = path.basename(filePath);
      if (!['node_modules', 'dist', '.git', 'pg2', '.angular'].includes(base)) {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const root = path.resolve('c:/Users/philg/Pocketgull/pocketgull');
const specFiles = walkDir(path.join(root, 'src')).concat(walkDir(path.join(root, 'tests')));
let modifiedCount = 0;

for (const file of specFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes("from 'vitest'") || content.includes('from "vitest"')) {
    // Replace all import lines referencing 'vitest'
    const newContent = content.split('\n').filter(line => {
      return !(line.includes("from 'vitest'") || line.includes('from "vitest"'));
    }).join('\n');

    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf-8');
      modifiedCount++;
    }
  }
}

console.log(`Successfully cleaned vitest imports from ${modifiedCount} spec files out of ${specFiles.length} total spec files.`);
