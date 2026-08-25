import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.resolve(__dirname, '../wordpress-theme/pocketgull-articles/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Google Fonts bundle URL for Outfit, Plus Jakarta Sans, Inter, Cinzel, JetBrains Mono
const fontUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';

async function bundleThemeFonts() {
  console.log("Fetching Google Fonts CSS...");
  const res = await fetch(fontUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch fonts CSS: ${res.statusText}`);
  }

  let cssText = await res.text();
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/s\/[^\)]+)\)/g;
  let match;
  const urls = [];
  while ((match = urlRegex.exec(cssText)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} font weights to download...`);

  let count = 0;
  for (const url of urls) {
    const rawName = path.basename(url);
    const localFilename = `gf_${count}_${rawName}`;
    const localPath = path.resolve(fontsDir, localFilename);

    if (!fs.existsSync(localPath)) {
      const fontRes = await fetch(url);
      if (fontRes.ok) {
        const buffer = Buffer.from(await fontRes.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
      }
    }

    cssText = cssText.replaceAll(url, `fonts/${localFilename}`);
    count++;
  }

  const outputCssPath = path.resolve(__dirname, '../wordpress-theme/pocketgull-articles/fonts.css');
  fs.writeFileSync(outputCssPath, cssText, 'utf-8');
  console.log(`✅ Successfully bundled all font files and created ${outputCssPath}!`);
}

bundleThemeFonts().catch(err => {
  console.error("Font bundling error:", err);
  process.exit(1);
});
