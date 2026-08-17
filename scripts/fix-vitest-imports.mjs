import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');
const testsDir = path.resolve(__dirname, '../tests');

function getAllSpecFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSpecFiles(filePath));
    } else if (file.endsWith('.spec.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

const specFiles = [...getAllSpecFiles(srcDir), ...getAllSpecFiles(testsDir)];
let modifiedCount = 0;

for (const file of specFiles) {
  let content = fs.readFileSync(file, 'utf8');
  // Match lines importing describe, it, expect, vi, beforeEach, afterEach, etc from 'vitest'
  const vitestImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]vitest['"];?\r?\n?/g;
  
  if (vitestImportRegex.test(content)) {
    content = content.replace(vitestImportRegex, (match, importsStr) => {
      const symbols = importsStr.split(',').map(s => s.trim());
      // Omit describe, it, test, beforeEach, afterEach, beforeAll, afterAll so Zone-patched globals are used.
      // Keep expect and vi for TypeScript type resolution.
      const zoneGlobals = new Set(['describe', 'it', 'test', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll']);
      const keptSymbols = symbols.filter(s => !zoneGlobals.has(s));
      if (keptSymbols.length > 0) {
        return `import { ${keptSymbols.join(', ')} } from 'vitest';\n`;
      }
      return '';
    });
    
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
}

console.log(`Successfully cleaned vitest imports across ${modifiedCount} spec files.`);
