import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targets = [
  path.join(rootDir, '.angular', 'cache'),
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'node_modules', '.cache', 'tsconfig.tsbuildinfo'),
  path.join(rootDir, 'packages', 'core-sdk', 'dist'),
  path.join(rootDir, 'packages', 'ismp-clinical-guard', 'dist'),
  path.join(rootDir, 'packages', 'clinical-parquet-duckdb', 'dist'),
  path.join(rootDir, 'packages', 'open-sanctuary', 'dist'),
  path.join(rootDir, 'packages', 'open-scribe', 'dist'),
  path.join(rootDir, 'pocketgull_api', 'dist'),
];

console.log('🧹 [Clean] Safely purging transient build caches and dist output...');

let clearedCount = 0;
for (const target of targets) {
  if (fs.existsSync(target)) {
    try {
      const stats = fs.statSync(target);
      if (stats.isDirectory()) {
        fs.rmSync(target, { recursive: true, force: true });
      } else {
        fs.unlinkSync(target);
      }
      console.log(`   ✓ Removed: ${path.relative(rootDir, target)}`);
      clearedCount++;
    } catch (err) {
      console.warn(`   ⚠️ Could not remove ${target}:`, err.message);
    }
  }
}

console.log(`✨ [Clean Complete] ${clearedCount} build cache target(s) cleared. Workspace is in a pristine state.\n`);
