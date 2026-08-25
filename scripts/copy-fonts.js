import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.resolve(__dirname, '../public/fonts');
const destDir = path.resolve(__dirname, '../docs/study/public/fonts');

if (!fs.existsSync(srcDir)) {
    console.error("Source fonts directory does not exist!");
    process.exit(1);
}

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
console.log(`Copied ${files.length} font files to docs/study/public/fonts/`);
